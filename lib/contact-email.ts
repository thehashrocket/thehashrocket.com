// Pure helpers for the contact email, kept out of lib/actions.ts because a
// "use server" module may only export async functions.

export const NAME_MAX = 100;

/** The email subject: name (one line, capped), then project type and source when present. */
export function contactSubject(name: string, projectType: string | null, source: string | undefined): string {
  const safeName = name.replace(/[\r\n]+/g, " ").trim().slice(0, NAME_MAX);
  return `New contact from ${safeName}${projectType ? ` - ${projectType}` : ""}${source ? ` (via ${source})` : ""}`;
}

/** "Try again in 12 minutes", in hours past an hour, from the limiter's reset time. */
export function tooManyMessage(resetAt: number | undefined, now = Date.now()): string {
  const waitMs = (resetAt ?? 0) - now;
  if (!Number.isFinite(waitMs) || waitMs <= 0) return "Too many submissions. Please try again later.";
  const minutes = Math.ceil(waitMs / 60_000);
  if (minutes <= 60) return `Too many submissions. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
  const hours = Math.ceil(minutes / 60);
  return `Too many submissions. Try again in ${hours} hours.`;
}
