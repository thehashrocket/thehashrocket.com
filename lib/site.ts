export const CONTACT_EMAIL = "jason@thehashrocket.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/jasonshultz/";
export const GITHUB_URL = "https://github.com/thehashrocket";

/**
 * The Cal.com booking URL, tagged with where the visitor came from. Returns
 * null when NEXT_PUBLIC_CALCOM_URL is unset or invalid, so callers can fall back
 * to the contact form instead of rendering a dead button.
 */
export function getBookingUrl(source?: string): string | null {
  const base = process.env.NEXT_PUBLIC_CALCOM_URL?.trim();
  if (!base || !URL.canParse(base)) return null;

  const url = new URL(base);
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (source) url.searchParams.set("source", source);
  return url.toString();
}

export function getContactHref(source?: string): string {
  return source ? `/contact?source=${encodeURIComponent(source)}` : "/contact";
}

/** Offer pages: sitemap, metadata and OG tests iterate this list. */
export const OFFER_ROUTES = ["/automation-sprint", "/ai-app-review", "/print-shops"] as const;
