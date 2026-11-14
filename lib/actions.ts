"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { PROJECT_TYPES, TIMELINES } from "@/lib/contact-options";
import { NAME_MAX, contactSubject, tooManyMessage } from "@/lib/contact-email";
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
/** The visitor's draft stays in the form (ContactForm keeps it on errors). */
const SEND_FAILED = "Your message wasn't sent. It's still in the form, so you can try again in a minute.";
/** RFC 5321 maximum; checked before the regex so a long input can't make it backtrack. */
const EMAIL_MAX = 254;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export interface ContactFormState {
  success: boolean;
  error: string | null;
  /**
   * "rate_limited" for any limiter denial (the client never learns which bucket);
   * "send_failed" when the email didn't go out. Both get an email/booking way through.
   */
  code: "rate_limited" | "send_failed" | null;
}

type LimiterName = "ip-day" | "ip" | "email" | "burst";

/** Limiter calls give up after this long and fail open. */
const LIMIT_TIMEOUT_MS = 1000;

/** Name and message only: an Upstash error can carry the REST URL. */
function errorReason(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : "unknown";
}

/** Rejects after `ms`. getRemaining ignores the Ratelimit `timeout` option, so it needs its own. */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

interface LimitGate {
  denied: boolean;
  /** When the denying limiter's window resets (Unix ms), if it said. */
  resetAt?: number;
  /** Spend one slot from each limiter. Call only after the message reached the inbox. */
  record: () => Promise<void>;
}

const OPEN_GATE: LimitGate = { denied: false, record: async () => {} };
const deniedGate = (resetAt: number | undefined): LimitGate => ({ denied: true, resetAt, record: async () => {} });

/**
 * Checks the three contact limits without spending them; `record` spends them once the
 * email has actually sent, so a failed send never locks a visitor (or a talk room) out.
 *
 *   check ip-day (30 / 1 d) → ip (10 / 1 h) → email (3 / 1 h)   [getRemaining, no slot used]
 *        │ any exhausted ─────────────────────────────────▶ "Too many submissions", no send
 *        ▼ all open
 *   burst (10 / 1 min per IP)                      [limit(), spends a slot now]
 *        │ exhausted ─────────────────────────────────────▶ "Too many submissions", no send
 *        ▼
 *   send via Resend ──fails──▶ "wasn't sent", nothing else recorded
 *        ▼ sent
 *   record: limit() on ip-day, ip and email (one slot each)
 *
 * The check spends nothing, so parallel requests would all pass it before any of them
 * records. The burst limiter is the atomic ceiling on that: it spends before the send,
 * so a parallel burst from one IP sends at most 10, the hourly IP allowance, and the
 * hourly check refuses everything after it once those sends record. It matches the
 * hourly limit so a talk room on one Wi-Fi still gets through. A failed send costs a
 * slot in this one-minute limiter only. Fails open: a setup failure skips every limiter,
 * and a failed or timed-out check skips only that limiter. Upstash counts in weighted
 * fixed windows (the daily one aligned to UTC midnight).
 */
async function checkLimits(email: string): Promise<LimitGate> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return OPEN_GATE;

  type Limiter = {
    getRemaining: (id: string) => Promise<{ remaining: number; reset?: number }>;
    limit: (id: string) => Promise<{ success: boolean; reset?: number; reason?: string }>;
  };
  let limiters: { name: LimiterName; limiter: Limiter; key: string }[];
  let burst: { limiter: Limiter; key: string };
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const make = (prefix: string, limiter: ReturnType<typeof Ratelimit.slidingWindow>) =>
      new Ratelimit({ redis, limiter, prefix, timeout: LIMIT_TIMEOUT_MS });

    // Prefer x-real-ip (set by Vercel). A client can spoof x-forwarded-for's leftmost entry, so it is only a fallback.
    const requestHeaders = await headers();
    const ip =
      requestHeaders.get("x-real-ip") ??
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anonymous";
    // A hash keeps addresses out of casual view in Redis; it is not a secret.
    const emailKey = createHash("sha256").update(email.toLowerCase()).digest("hex");

    limiters = [
      { name: "ip-day", limiter: make("contact:ip-day", Ratelimit.slidingWindow(30, "1 d")), key: ip },
      { name: "ip", limiter: make("contact:ip", Ratelimit.slidingWindow(10, "1 h")), key: ip },
      { name: "email", limiter: make("contact:email", Ratelimit.slidingWindow(3, "1 h")), key: emailKey },
    ];
    burst = { limiter: make("contact:burst", Ratelimit.slidingWindow(10, "1 m")), key: ip };
  } catch (err) {
    console.warn("Contact rate limit unavailable, failing open", { limiter: "setup", reason: errorReason(err) });
    return OPEN_GATE;
  }

  for (const { name, limiter, key } of limiters) {
    try {
      const { remaining, reset } = await withTimeout(limiter.getRemaining(key), LIMIT_TIMEOUT_MS);
      if (remaining <= 0) {
        console.warn("Contact rate limit denied", { limiter: name });
        return deniedGate(reset);
      }
    } catch (err) {
      console.warn("Contact rate limit unavailable, failing open", { limiter: name, reason: errorReason(err) });
    }
  }

  try {
    // limit() honors the constructor timeout itself, resolving as allowed.
    const { success, reset } = await burst.limiter.limit(burst.key);
    if (!success) {
      console.warn("Contact rate limit denied", { limiter: "burst" });
      return deniedGate(reset);
    }
  } catch (err) {
    console.warn("Contact rate limit unavailable, failing open", { limiter: "burst", reason: errorReason(err) });
  }

  return {
    denied: false,
    record: async () => {
      await Promise.all(
        limiters.map(async ({ name, limiter, key }) => {
          try {
            const result = await limiter.limit(key);
            if (result.reason === "timeout") {
              console.warn("Contact rate limit not recorded", { limiter: name, reason: "timeout" });
            }
          } catch (err) {
            console.warn("Contact rate limit not recorded", { limiter: name, reason: errorReason(err) });
          }
        }),
      );
    },
  };
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

  // Rate limiting (fail-open): one source per day, one source per hour, one person per hour.
  // Checked before sending and recorded only after a successful send, so a failed send
  // never uses up a slot. A talk room on shared venue Wi-Fi fits under the hourly IP limit.
  const gate = testRun ? OPEN_GATE : await checkLimits(email);
  if (gate.denied) {
    return { success: false, error: tooManyMessage(gate.resetAt), code: "rate_limited" };
  }

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
        return { success: false, error: SEND_FAILED, code: "send_failed" };
      }
    } catch (err) {
      console.error("Contact form error:", err);
      return { success: false, error: SEND_FAILED, code: "send_failed" };
    }
    await gate.record();
  }

  return { success: true, error: null, code: null };
}
