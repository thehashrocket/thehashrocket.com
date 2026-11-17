export const CONTACT_EMAIL = "jason@jasonshultz.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/jasonshultz/";
export const GITHUB_URL = "https://github.com/thehashrocket";

/**
 * How the site names Jason: page titles, the footer, JSON-LD and share images.
 * Consultant framing, because the site sells offers to business owners. Not a job title for recruiters.
 */
export const JOB_TITLE = "Software & Automation Consultant";
export const SITE_TITLE = `Jason Shultz — ${JOB_TITLE}`;

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

/**
 * Offer and talk pages, not only priced offers. The sitemap, metadata,
 * first-screen and canvas-dimming checks all iterate this list.
 */
export const OFFER_ROUTES = ["/automation-sprint", "/ai-app-review", "/care-plan", "/print-shops", "/talks"] as const;

export type OfferRoute = (typeof OFFER_ROUTES)[number];

/** Sitemap lastModified per offer route (YYYY-MM-DD). Refresh a route's date when its page changes. */
export const OFFER_ROUTE_UPDATED: Record<OfferRoute, string> = {
  "/automation-sprint": "2026-11-15",
  "/ai-app-review": "2026-11-15",
  "/care-plan": "2026-11-15",
  "/print-shops": "2026-11-14",
  "/talks": "2026-11-14",
};
