"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { PROJECT_TYPES, TIMELINES } from "@/lib/contact-options";
import { NAME_MAX, contactSubject } from "@/lib/contact-email";
import { normalizeSource } from "@/lib/sources";

let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY environment variable is not set");
    resendClient = new Resend(key);
  }
  return resendClient;
}

function pickAllowed(value: FormDataEntryValue | null, allowed: Iterable<string>): string | null {
  return typeof value === "string" && new Set(allowed).has(value) ? value : null;
}

const MESSAGE_MAX = 5000;
/** RFC 5321 maximum; checked before the regex so a long input can't make it backtrack. */
const EMAIL_MAX = 254;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export interface ContactFormState {
  success: boolean;
  error: string | null;
  /** "rate_limited" for any limiter denial; the client never learns which bucket. */
  code: "rate_limited" | null;
}

type LimiterName = "ip-day" | "ip" | "email";

/** Name and message only: an Upstash error can carry the REST URL. */
function errorReason(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : "unknown";
}

/**
 * True when a limiter denies. Fails open: a setup failure skips every limiter, and a
 * failed or timed-out call treats only that limiter as allowed, so later ones still run.
 *
 *   ip-day (30 / 1 d) ──allow──▶ ip (10 / 1 h) ──allow──▶ email (3 / 1 h) ──allow──▶ send
 *        │deny                       │deny                     │deny
 *        └───────────────────────────┴─────────────────────────┴──▶ "Too many submissions"
 *
 * Upstash counts in weighted fixed windows (the daily one aligned to UTC midnight) and
 * does not count a denied call, so a denial never spends a later bucket.
 */
async function rateLimited(email: string): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return false;

  let checks: { limiter: LimiterName; check: () => Promise<{ success: boolean; reason?: string }> }[];
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const make = (prefix: string, limiter: ReturnType<typeof Ratelimit.slidingWindow>) =>
      new Ratelimit({ redis, limiter, prefix, timeout: 1000 });

    // Prefer x-real-ip (set by Vercel). A client can spoof x-forwarded-for's leftmost entry, so it is only a fallback.
    const requestHeaders = await headers();
    const ip =
      requestHeaders.get("x-real-ip") ??
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anonymous";
    // A hash keeps addresses out of casual view in Redis; it is not a secret.
    const emailKey = createHash("sha256").update(email.toLowerCase()).digest("hex");

    const ipDay = make("contact:ip-day", Ratelimit.slidingWindow(30, "1 d"));
    const ipHour = make("contact:ip", Ratelimit.slidingWindow(10, "1 h"));
    const perEmail = make("contact:email", Ratelimit.slidingWindow(3, "1 h"));
    checks = [
      { limiter: "ip-day", check: () => ipDay.limit(ip) },
      { limiter: "ip", check: () => ipHour.limit(ip) },
      { limiter: "email", check: () => perEmail.limit(emailKey) },
    ];
  } catch (err) {
    console.warn("Contact rate limit unavailable, failing open", { limiter: "setup", reason: errorReason(err) });
    return false;
  }

  for (const { limiter, check } of checks) {
    try {
      const result = await check();
      if (result.reason === "timeout") {
        console.warn("Contact rate limit unavailable, failing open", { limiter, reason: "timeout" });
        continue;
      }
      if (!result.success) {
        console.warn("Contact rate limit denied", { limiter });
        return true;
      }
    } catch (err) {
      console.warn("Contact rate limit unavailable, failing open", { limiter, reason: errorReason(err) });
    }
  }
  return false;
}

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = text(formData.get("name"));
  // Trimmed before validation so the checked, rate-limited and emailed address agree.
  const email = text(formData.get("email")).trim();
  // Browsers submit textarea line breaks as CRLF but count them as one character in
  // maxLength; normalize so the server counts what the visitor saw.
  const message = text(formData.get("message")).replace(/\r\n/g, "\n");
  const honeypot = text(formData.get("website"));
  const source = normalizeSource(formData.get("source"));
  const projectType = pickAllowed(formData.get("projectType"), PROJECT_TYPES);
  const timeline = pickAllowed(formData.get("timeline"), TIMELINES);

  // Honeypot check
  if (honeypot) {
    return { success: true, error: null, code: null };
  }

  // Validation
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters.", code: null };
  }
  if (name.length > NAME_MAX) {
    return { success: false, error: `Name must be ${NAME_MAX} characters or fewer.`, code: null };
  }
  if (!email || email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address.", code: null };
  }
  if (!message || message.trim().length < 10) {
    return { success: false, error: "Message must be at least 10 characters.", code: null };
  }
  if (message.length > MESSAGE_MAX) {
    return { success: false, error: `Message must be ${MESSAGE_MAX.toLocaleString("en-US")} characters or fewer.`, code: null };
  }

  // Test runs (TEST_EMAIL_ENABLED=true, set by the Playwright webServer) skip the limiter
  // and email so local e2e never spends Upstash quota or sends mail. Production ignores
  // the flag: a stray value there would drop every inquiry behind a success message.
  const testRun = process.env.TEST_EMAIL_ENABLED === "true" && process.env.VERCEL_ENV !== "production";

  // Rate limiting (fail-open). Three limits, checked in order so a denial never spends
  // a later bucket: one source per day, one source per hour, one person per hour.
  // A talk room on shared venue Wi-Fi fits under the hourly IP limit (see docs/ARCHITECTURE.md).
  if (!testRun) {
    const denied = await rateLimited(email);
    if (denied) {
      return { success: false, error: "Too many submissions. Please try again later.", code: "rate_limited" };
    }
  }

  // Skip email delivery in test environments
  if (!testRun) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "contact@thehashrocket.com";
      const { error: sendError } = await getResend().emails.send({
        from: `Contact Form <${fromEmail}>`,
        to: "jason@thehashrocket.com",
        subject: contactSubject(name, projectType, source),
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          source && `Source: ${source}`,
          projectType && `Needs: ${projectType}`,
          timeline && `Timeline: ${timeline}`,
          "",
          "Message:",
          message,
        ]
          .filter((line) => typeof line === "string")
          .join("\n"),
      });

      if (sendError) {
        console.error("Resend send failed:", sendError);
        return { success: false, error: "Something went wrong. Please try again.", code: null };
      }
    } catch (err) {
      console.error("Contact form error:", err);
      return { success: false, error: "Something went wrong. Please try again.", code: null };
    }
  }

  return { success: true, error: null, code: null };
}
