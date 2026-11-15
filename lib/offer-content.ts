// Page copy for the offer pages. Numbers come from lib/offers.ts; this file
// never types a price (test/claims.test.ts scans it). Keep client components
// on lib/offers.ts so this copy stays out of client bundles.
import type { FAQ } from "@/lib/locations";
import {
  CARE_PLAN_HOURS,
  CARE_PLAN_MAX,
  CARE_PLAN_MAX_HOURS,
  CARE_PLAN_MAX_SYSTEMS,
  CARE_PLAN_MIN,
  REVIEW_CREDIT_DAYS,
  REVIEW_CREDIT_TEXT,
  REVIEW_MAX_INTEGRATIONS,
  REVIEW_TURNAROUND,
  SPRINT_MAX_SYSTEMS,
  SPRINT_PRICE_MAX,
  SPRINT_PRICE_MIN,
  formatReviewPrice,
  formatUsd,
} from "@/lib/offers";

// --- AI-built app review ------------------------------------------------------

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

// --- Automation sprint ----------------------------------------------------------

export interface SprintExample {
  title: string;
  body: string;
  /** Case study that backs the example. */
  proofSlug: string;
}

/** Only examples a case study backs (claims rule). */
export const sprintExamples: SprintExample[] = [
  {
    title: "Quote to invoice",
    body: "A job moves from quote to invoice without anyone retyping it, and the invoice goes out as a PDF.",
    proofSlug: "print-portal",
  },
  {
    title: "QuickBooks sync",
    body: "Jobs, customers and invoices sync with QuickBooks both ways, so nobody re-keys invoices by hand.",
    proofSlug: "print-portal",
  },
  {
    title: "An automation that broke",
    body: "An automation the business relies on stopped working reliably. I work out what it does, then repair it.",
    proofSlug: "automation-rescue",
  },
];

export const sprintSteps = [
  "A 20-minute call about the process that's costing you the most time.",
  "A one-page scope: the one process, the systems it touches, a fixed price, and one success metric we both sign.",
  "The build.",
  "Handoff: we check the result against the success metric together.",
];

export const sprintPrerequisites = [
  "Access to every system the process touches, ready on the start date.",
  "One person on your side who owns the process and can answer questions within a day or two.",
];

export const sprintTerms = [
  "The clock starts when the one-page scope is signed and access works.",
  "Third-party subscriptions are yours and billed to you directly.",
  "If the process changes mid-sprint, the change gets its own scope. Nothing expands quietly.",
  "Cleaning up data beyond what the process needs is quoted separately.",
  "If I'm waiting on your side for more than 5 business days, the clock pauses.",
  "For 14 days after handoff, anything that misses the success metric is fixed at no charge. Anything else is a change.",
];

export const sprintExclusion =
  "Anything outside the one process is quoted separately as a new scope. Upkeep after handoff is the care plan, below.";

export const sprintFaqs: FAQ[] = [
  {
    question: "What moves a sprint from the low end of the range to the high end?",
    answer: `Mostly how many systems the process touches (up to ${SPRINT_MAX_SYSTEMS}), how clean the data is, and how many exceptions the process has. The price is fixed in the one-page scope before work starts: ${formatUsd(SPRINT_PRICE_MIN)} at the simple end, ${formatUsd(SPRINT_PRICE_MAX)} at the top.`,
  },
  {
    question: "Do I need custom automation at all?",
    answer:
      "Often not. Sometimes a feature in software you already pay for does the job, and I'll tell you so on the first call. Sometimes a small integration between tools you already use is enough. A custom build makes sense when neither of those fits how your business actually works.",
  },
  {
    question: "What if the process is bigger than one sprint?",
    answer:
      "Then the scope call says so and you get a quote for the larger build instead. The sprint is for one process with a clear finish line.",
  },
];

// --- Care plan -----------------------------------------------------------------
// The five coverage rows are service promises, confirmed by the owner on 2026-11-15 (#89). Changing one is an owner decision.
// Routine and security updates are part of the base price and never use the included hours (#89, 2026-11-15).

export interface CareCoverage {
  title: string;
  body: string;
  /** A smaller second line, such as the reply window. */
  note?: string;
}

/** Office hours for the reply promise, shared by the coverage row and the FAQ. */
export const careReplyWindow =
  "Monday to Friday, 8am to 5pm Pacific. After hours, you hear from me the next business morning.";

export const careCoverage: CareCoverage[] = [
  {
    title: "Monitoring",
    body: "I check your sites and services every 5 minutes. When one goes down, the alert comes to me, not you.",
  },
  {
    title: "Backups",
    body: "Daily backups, kept for 30 days. Every quarter I restore one to prove it works.",
  },
  {
    title: "Updates",
    body: "Security updates within a week and routine updates monthly, tested first (in staging when your system has one). Updates are included and don't use your hours.",
  },
  {
    title: "Included hours each month",
    body: `${CARE_PLAN_HOURS} hours with one system, ${CARE_PLAN_MAX_HOURS} with two or three. For fixes, small changes, questions, or an update that breaks something or needs code changes to apply.`,
  },
  {
    title: "Same-business-day reply when something breaks",
    body: "You tell me what's wrong and I reply the same business day with what I'm doing about it.",
    note: careReplyWindow,
  },
];

/** The two tiers, stated outright so a two-system client isn't left guessing (#89). */
export const careTiers: { systems: string; price: string; hours: string }[] = [
  { systems: "1 system", price: `${formatUsd(CARE_PLAN_MIN)} a month`, hours: `${CARE_PLAN_HOURS} hours included` },
  {
    systems: `2–${CARE_PLAN_MAX_SYSTEMS} systems`,
    price: `${formatUsd(CARE_PLAN_MAX)} a month`,
    hours: `${CARE_PLAN_MAX_HOURS} hours included`,
  },
  { systems: `More than ${CARE_PLAN_MAX_SYSTEMS}`, price: "Quoted", hours: "Scoped to what you run" },
];

export const carePriceLine = "A system is one site or app with one production deployment.";

/** The reply is an acknowledgment and a plan, never a promise the fix lands that day. */
export const careHoursOut =
  "Extra time is quoted before I start it. Routine and security updates never count toward your hours, so they can't use them up before you ask for anything. The same-day reply tells you what's happening and what it will take; it isn't a deadline for the fix.";

/** What it takes before coverage starts, by where the system came from, each with its cost (#89). */
export const careOnboarding: { from: string; detail: string; href?: string; linkLabel?: string }[] = [
  {
    from: "Something I built or fixed (a sprint, a larger build, or the fixes from a review)",
    detail: "No onboarding check. Coverage can start at handoff.",
  },
  {
    from: "An app built with AI",
    detail: `The AI-built app review is the onboarding check: ${formatReviewPrice()}. The fixes it finds are quoted the usual way, and the review fee is credited toward them if you sign their scope within ${REVIEW_CREDIT_DAYS} days of the report.`,
    href: "/ai-app-review",
    linkLabel: "See the app review →",
  },
  {
    from: "Anything else someone else built",
    detail: "An onboarding check, quoted after a 20-minute call. The fixes it finds are quoted separately.",
  },
];

export const careOnboardingRule = "Coverage starts once the check and any fixes it finds are done.";

export const careTerms: { term: string; detail: string }[] = [
  {
    term: "What hours cover",
    detail: "Fixes, small changes, work on anything that breaks, and any update that breaks something or needs code changes to apply.",
  },
  {
    term: "What doesn't use hours",
    detail: "Monitoring, backups, restore checks, and routine and security updates.",
  },
  {
    term: "Quoted separately",
    detail:
      "Major-version upgrades (a framework, PHP or Node major, or a WordPress major that needs a theme rework) and anything bigger than the hours cover.",
  },
  { term: "Unused hours", detail: "Don't roll over to the next month." },
  {
    term: "After a sprint",
    detail: "Fixes under a sprint's 14-day acceptance window are free and never use care hours.",
  },
  { term: "Commitment", detail: "Month to month. Cancel with 30 days' notice." },
];

export const careFaqs: FAQ[] = [
  {
    question: "What sets my monthly price?",
    answer: `How many systems you run. One system is ${formatUsd(CARE_PLAN_MIN)} a month with ${CARE_PLAN_HOURS} hours included; two or three are ${formatUsd(CARE_PLAN_MAX)} a month with ${CARE_PLAN_MAX_HOURS} hours. A system is one site or app with one production deployment, and more than ${CARE_PLAN_MAX_SYSTEMS} is quoted. You get the number before you sign.`,
  },
  {
    question: "What if I need more than my included hours in a month?",
    answer:
      "Extra time is quoted before I start it, so nothing shows up on an invoice you didn't agree to. Routine and security updates don't count toward your hours.",
  },
  {
    question: "Can you look after something someone else built?",
    answer: `Yes. It starts with an onboarding check. For an app built with AI, that's the ${formatReviewPrice()} AI-built app review; for anything else, the check is quoted after a 20-minute call. Fixes the check finds are quoted separately, and coverage starts once the check and those fixes are done.`,
  },
];

// --- Talks ---------------------------------------------------------------------
// The title and takeaways live in lib/talk.ts (a leaf module the tests import).

/** The hero's one line on what attendees leave with. */
export const talkScope = "You leave with one job picked out and a way to check it’s working.";

export const talkFormat = "In person in the Sacramento, Stockton and Modesto areas, or online.";

// --- Local and reachable (#98, #108) -------------------------------------------
// Sits right under each offer hero's price. Kept to one line on a 375px phone so the
// hero fits a 375x560 screen; the three cities stay on talkFormat (test/offers.test.ts).

export const sprintLocalLine = "Central Valley based. In person or remote, and you talk to me.";

/** The review is delivered remotely, so it leads with that; in person is the option. */
export const reviewLocalLine = "Remote, or in person in the Central Valley. You talk to me.";
