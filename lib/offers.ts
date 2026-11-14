// Every offer number on the site lives here and renders through these
// formatters, so changing an offer is one edit. Page copy lives in
// lib/offer-content.ts. Keep this file free of value imports: client
// components may use it (test/offers.test.ts enforces type-only imports).

/** AI-built app review: flat fee in US dollars. */
export const REVIEW_PRICE = 1500;
export const REVIEW_TURNAROUND = "3 weeks";
/** Reviews taken per month; null hides the line. */
export const REVIEW_MONTHLY_CAP: number | null = 3;
export const REVIEW_MAX_INTEGRATIONS = 3;
/** The fee is credited toward a fix or sprint that starts within this many days of the report. */
export const REVIEW_CREDIT_DAYS = 30;
/**
 * "small-door": the review sits in the starter ladder beside the sprint.
 * "premium": it leaves the ladder and gets its own line (reviewLineText).
 */
export type ReviewFraming = "small-door" | "premium";
export const REVIEW_FRAMING: ReviewFraming = "small-door";

/** Automation sprint: one process, fixed before work starts. */
export const SPRINT_PRICE_MIN = 3500;
export const SPRINT_PRICE_MAX = 5000;
export const SPRINT_WEEKS = "2–3";
/** Sprints taken per month; null hides the line. */
export const SPRINT_MONTHLY_CAP: number | null = 2;
export const SPRINT_MAX_SYSTEMS = 3;

/** The cheapest fixed-price way to start: the city-page badge shows it. */
export const LOWEST_FIXED_PRICE = Math.min(REVIEW_PRICE, SPRINT_PRICE_MIN);

/** Care plan (launches in release 2; the values are set now). */
export const CARE_PLAN_MIN = 300;
export const CARE_PLAN_MAX = 600;
export const CARE_PLAN_HOURS = 2;
export const CARE_PLAN_MAX_CLIENTS: number | null = 10;

/** Larger builds. */
export const BUILD_PRICE_FLOOR = 10000;

// Fixed locale and currency so server and client render the same string.
const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUsd(amount: number): string {
  return priceFormat.format(amount);
}

/** "$3,500–$5,000". Throws on an inverted or empty range: a bad constant must break the build, not render. */
export function formatUsdRange(min: number, max: number): string {
  if (!(min < max)) throw new Error(`formatUsdRange: min (${min}) must be below max (${max})`);
  return `${formatUsd(min)}–${formatUsd(max)}`;
}

/** "$3.5K", "$10K". */
export function formatUsdCompact(amount: number): string {
  return compactFormat.format(amount);
}

export function formatReviewPrice(): string {
  return formatUsd(REVIEW_PRICE);
}

export function formatSprintPrice(): string {
  return formatUsdRange(SPRINT_PRICE_MIN, SPRINT_PRICE_MAX);
}

export const REVIEW_CREDIT_TEXT = `If you hire me for a fix or an automation sprint that starts within ${REVIEW_CREDIT_DAYS} days of the report, the review fee is credited toward it, up to that work's price. Unused credit isn't paid out.`;

/** A capacity line, or null when the cap is unset or not positive. */
export function capLine(cap: number | null, unit: string): string | null {
  return cap !== null && cap > 0 ? `I take ${cap} ${unit} a month. Ask about the next available start.` : null;
}

// --- The pricing ladder ------------------------------------------------------

export type LadderOffer = "sprint" | "review" | "build";

export interface LadderPart {
  /** Which offer this segment names; null for joining text. */
  offer: LadderOffer | null;
  text: string;
  href?: string;
}

/** "a" or "an", by how the formatted price is spoken ("an $8,000", "an $11,000"). */
export function indefiniteArticle(price: string): "a" | "an" {
  // The spoken number starts with its leading digit group: "8"/"80"/"800" (eight…), "11", "18".
  const lead = price.replace(/^\$/, "").split(/[,–]/)[0];
  return lead.startsWith("8") || lead === "11" || lead === "18" ? "an" : "a";
}

/**
 * The ordered pricing sentence as segments, so the homepage can link each offer
 * while metadata and FAQ answers use the plain text. Order by `offer`, never by
 * price string: two offers can share a price.
 */
export function offerLadderParts(framing: ReviewFraming = REVIEW_FRAMING): LadderPart[] {
  const sprint = formatSprintPrice();
  const review = formatReviewPrice();
  const parts: LadderPart[] = [
    { offer: null, text: `Start with ${indefiniteArticle(sprint)} ` },
    { offer: "sprint", text: `${sprint} automation sprint`, href: "/automation-sprint" },
  ];
  if (framing === "small-door") {
    parts.push(
      { offer: null, text: ` or ${indefiniteArticle(review)} ` },
      { offer: "review", text: `${review} AI-built app review`, href: "/ai-app-review" },
    );
  }
  parts.push(
    { offer: null, text: ". " },
    { offer: "build", text: `Larger builds start at ${formatUsd(BUILD_PRICE_FLOOR)}` },
    { offer: null, text: "." },
  );
  return parts;
}

export function offerLadderText(framing: ReviewFraming = REVIEW_FRAMING): string {
  return offerLadderParts(framing)
    .map((part) => part.text)
    .join("");
}

/** The review's own line under the premium framing; not rendered under small-door. */
export function reviewLineText(): string {
  return `Inherited an app someone built with AI? A fixed-fee review is ${formatReviewPrice()}, with the written report within ${REVIEW_TURNAROUND}.`;
}
