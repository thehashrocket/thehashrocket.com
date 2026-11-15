// Pure helpers for the contact email, kept out of lib/actions.ts because a
// "use server" module may only export async functions.

export const NAME_MAX = 100;

/**
 * The sender when RESEND_FROM_EMAIL is unset. It must be on mail.jasonshultz.com exactly:
 * jasonshultz.com publishes a strict DMARC record (p=reject, adkim=s, aspf=s) and the
 * production Resend key is restricted to that subdomain, so a root-domain sender is rejected.
 */
export const CONTACT_FROM_FALLBACK = "contact@mail.jasonshultz.com";

/** The only domain the contact form may send from (see CONTACT_FROM_FALLBACK). */
export const CONTACT_FROM_DOMAIN = "mail.jasonshultz.com";

/**
 * The sender to use: RESEND_FROM_EMAIL trimmed, when it is one plain address on
 * CONTACT_FROM_DOMAIN; otherwise the fallback, with a warning so a bad Vercel value is
 * visible in the logs instead of failing every send.
 */
export function contactFromAddress(configured: string | undefined): string {
  const value = (configured ?? "").trim();
  if (!value) return CONTACT_FROM_FALLBACK;
  if (isSingleEmailAddress(value) && value.toLowerCase().endsWith(`@${CONTACT_FROM_DOMAIN}`)) return value;
  console.warn("Contact sender ignored: RESEND_FROM_EMAIL is not one address on the allowed domain", {
    domain: CONTACT_FROM_DOMAIN,
  });
  return CONTACT_FROM_FALLBACK;
}

/**
 * One plain address, from an explicit list of allowed characters: no whitespace or
 * control characters (so no header line breaks), nothing that makes a list or a display
 * name (, ; < > "), no comments or brackets, no leading, trailing or doubled dots before
 * the @, and a dotted domain without empty labels or labels over 63 characters.
 * The address becomes the email's Reply-To, so replying must reach exactly the person
 * who wrote in. Quoted local parts and non-ASCII addresses are refused; the browser's
 * email field refuses most of them too.
 */
const ATOM = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LOCAL_PART = `${ATOM}(?:\\.${ATOM})*`;
const LABEL = "[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?";
const DOMAIN = `${LABEL}(?:\\.${LABEL})+`;
const SINGLE_ADDRESS = new RegExp(`^${LOCAL_PART}@${DOMAIN}$`);

export function isSingleEmailAddress(value: string): boolean {
  return SINGLE_ADDRESS.test(value);
}

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
