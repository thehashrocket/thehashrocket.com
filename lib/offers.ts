// The fixed-fee AI-built app review. Every price on the site renders from
// REVIEW_PRICE through formatReviewPrice(), so changing the offer is one edit
// here. Keep this file free of value imports: client components may use it.
import type { FAQ } from "@/lib/locations";

/** Flat fee in US dollars. */
export const REVIEW_PRICE = 5000;
export const REVIEW_TURNAROUND = "3 weeks";
/** Reviews taken per month; null hides the line. */
export const REVIEW_MONTHLY_CAP: number | null = 3;
export const REVIEW_MAX_INTEGRATIONS = 3;
/** The fee is credited toward a fix that starts within this many days of the report. */
export const REVIEW_CREDIT_DAYS = 30;

// Fixed locale and currency so server and client render the same string.
const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(amount: number): string {
  return priceFormat.format(amount);
}

export function formatReviewPrice(): string {
  return formatUsd(REVIEW_PRICE);
}

export const REVIEW_CREDIT_TEXT = `If you hire me to fix what the review finds and the fix starts within ${REVIEW_CREDIT_DAYS} days of the report, the review fee is credited toward it.`;

export const scannerQuestions = [
  "Can the business depend on this app day to day?",
  "What breaks first as more people use it?",
  "Who owns the data, and is anything backing it up?",
  "Could another engineer pick it up and maintain it?",
  "Should you fix it, rebuild it, or replace it with off-the-shelf software?",
];

export const reviewChecks = [
  "Secrets in the source code and the repository history",
  "Sign-in, permissions, and who can reach what",
  "How customer and business data is stored and handled",
  "Dependencies and how out of date they are",
  "Backups, deploys, and what happens when something fails",
];

export const reviewDeliverables = [
  "A written report in plain language that you keep",
  "Fixes in priority order, with what each one protects",
  "A call to walk through the findings together",
  "When fixing is the right call, a fixed quote to fix the top items",
];

export const reviewIsNot = [
  "It isn't a penetration test. I review the code and configuration; I don't attack the running system.",
  "It isn't the fixes. You get the list and, if you want it, a quote. The work itself is separate.",
];

export const reviewSteps = [
  "Book a call or send a message. We confirm the app fits the scope below.",
  "You grant read access and we do a 30-minute walkthrough of how the app is used.",
  `You get the report within ${REVIEW_TURNAROUND}, then we go through it on a call.`,
];

export const reviewScope = [
  `One codebase, one production deployment, one database, a single tenant, and up to ${REVIEW_MAX_INTEGRATIONS} third-party integrations. Anything larger gets a quote instead.`,
  "What I need from you: read access to the repository, read access to the hosting console, and a 30-minute walkthrough.",
  "The turnaround starts on the agreed start date, once access works and the walkthrough is done. Incomplete access delays the start.",
  "Anything urgent, like a live exposed secret or open admin access, is reported the same day I find it.",
  "Anything the access doesn't reach is listed in the report as not verified.",
];

export const reviewFaqs: FAQ[] = [
  {
    question: "Does it matter which AI tool built the app?",
    answer:
      "No. Lovable, Bolt, Replit, Cursor, ChatGPT, or a contractor who leaned on one of them: the review looks at what was built, not how. Apps you inherited from someone else qualify too.",
  },
  {
    question: "Is this a security audit or a penetration test?",
    answer:
      "It's a code and configuration review. Automated scanning is included, but the value is a senior engineer reading the code and telling you what matters. It doesn't replace a penetration test if your industry requires one.",
  },
  {
    question: "What happens after the review?",
    answer: `You keep the report whatever you decide. If fixing is the right call, I give you a fixed quote for the top items. ${REVIEW_CREDIT_TEXT}`,
  },
  {
    question: "Do I still need a paid discovery?",
    answer:
      "Not for this app. For a single AI-built app, the review takes the place of discovery: it's the written plan you'd otherwise pay for.",
  },
];
