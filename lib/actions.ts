"use server";

import { headers } from "next/headers";
import { Resend } from "resend";

let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY environment variable is not set");
    resendClient = new Resend(key);
  }
  return resendClient;
}

interface ContactFormState {
  success: boolean;
  error: string | null;
}

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;
  const honeypot = formData.get("website") as string;
  const source = formData.get("source") as string | null;

  // Honeypot check
  if (honeypot) {
    return { success: true, error: null };
  }

  // Validation
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!message || message.trim().length < 10) {
    return { success: false, error: "Message must be at least 10 characters." };
  }

  // Rate limiting (fail-open)
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, "1 h"),
      });

      const ip = (await headers()).get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return { success: false, error: "Too many submissions. Please try again later." };
      }
    }
  } catch {
    // Fail open — if rate limiting is unavailable, accept the submission
  }

  // Send email
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "contact@thehashrocket.com";
    const { error: sendError } = await getResend().emails.send({
      from: `Contact Form <${fromEmail}>`,
      to: "jason@thehashrocket.com",
      subject: `New contact from ${name}${source ? ` (via ${source})` : ""}`,
      text: `Name: ${name}\nEmail: ${email}${source ? `\nSource: ${source}` : ""}\n\nMessage:\n${message}`,
    });

    if (sendError) {
      console.error("Resend send failed:", sendError);
      return { success: false, error: "Something went wrong. Please try again." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Contact form error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
