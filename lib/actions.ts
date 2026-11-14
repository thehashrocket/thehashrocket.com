"use server";

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

interface ContactFormState {
  success: boolean;
  error: string | null;
}

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = text(formData.get("name"));
  const email = text(formData.get("email"));
  // Browsers submit textarea line breaks as CRLF but count them as one character in
  // maxLength; normalize so the server counts what the visitor saw.
  const message = text(formData.get("message")).replace(/\r\n/g, "\n");
  const honeypot = text(formData.get("website"));
  const source = normalizeSource(formData.get("source"));
  const projectType = pickAllowed(formData.get("projectType"), PROJECT_TYPES);
  const timeline = pickAllowed(formData.get("timeline"), TIMELINES);

  // Honeypot check
  if (honeypot) {
    return { success: true, error: null };
  }

  // Validation
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }
  if (name.length > NAME_MAX) {
    return { success: false, error: `Name must be ${NAME_MAX} characters or fewer.` };
  }
  if (!email || email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!message || message.trim().length < 10) {
    return { success: false, error: "Message must be at least 10 characters." };
  }
  if (message.length > MESSAGE_MAX) {
    return { success: false, error: `Message must be ${MESSAGE_MAX.toLocaleString("en-US")} characters or fewer.` };
  }

  // Test runs (TEST_EMAIL_ENABLED=true, set by the Playwright webServer) skip the limiter
  // and email so local e2e never spends Upstash quota or sends mail. Production ignores
  // the flag: a stray value there would drop every inquiry behind a success message.
  const testRun = process.env.TEST_EMAIL_ENABLED === "true" && process.env.VERCEL_ENV !== "production";

  // Rate limiting (fail-open).
  if (!testRun) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");

      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const ratelimit = new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(3, "1 h"),
        });

        // Prefer x-real-ip (set by Vercel). A client can spoof x-forwarded-for's leftmost entry, so it is only a fallback.
        const requestHeaders = await headers();
        const ip =
          requestHeaders.get("x-real-ip") ??
          requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "anonymous";
        const { success } = await ratelimit.limit(ip);
        if (!success) {
          return { success: false, error: "Too many submissions. Please try again later." };
        }
      }
    } catch {
      // Fail open — if rate limiting is unavailable, accept the submission
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
        return { success: false, error: "Something went wrong. Please try again." };
      }
    } catch (err) {
      console.error("Contact form error:", err);
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }

  return { success: true, error: null };
}
