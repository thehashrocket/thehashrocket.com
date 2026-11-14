// Shared by ContactForm (client) and submitContact (server), so keep this free
// of imports that would pull site data into the client bundle.
export const PROJECT_TYPES = [
  "New build",
  "Automation sprint",
  "Rescue",
  "AI-built app review",
  "Ongoing support",
  "A talk for my group",
  "Not sure",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "1–3 months",
  "3–6 months",
  "Just exploring",
] as const;

const TALK_PROJECT_TYPE = "A talk for my group" satisfies (typeof PROJECT_TYPES)[number];

/** Preselects the form's project type for visitors arriving from an offer page. Still editable. */
export const PROJECT_TYPE_BY_SOURCE = {
  "ai-app-review": "AI-built app review",
  "automation-sprint": "Automation sprint",
  "care-plan": "Ongoing support",
  "print-shops": "New build",
  talks: TALK_PROJECT_TYPE,
} satisfies Partial<Record<string, (typeof PROJECT_TYPES)[number]>>;

export function projectTypeForSource(
  source: string | undefined,
): (typeof PROJECT_TYPES)[number] | undefined {
  if (!source || !Object.hasOwn(PROJECT_TYPE_BY_SOURCE, source)) return undefined;
  return PROJECT_TYPE_BY_SOURCE[source as keyof typeof PROJECT_TYPE_BY_SOURCE];
}


const GENERIC_NEXT_STEPS = [
  "I reply within one business day.",
  "We do a 20-minute call.",
  "You get a written proposal or an honest “I’m not your guy.”",
];

const TALK_NEXT_STEPS = [
  "I reply within one business day.",
  "We pick a date and a format.",
  "I send a short outline for your group.",
];

export interface ContactFlow {
  /** "What happens next", in order. */
  nextSteps: readonly string[];
  /** A line under the steps, if any. */
  note?: string;
  /** Project timelines mean nothing to someone booking a talk. The server treats timeline as optional. */
  showTimeline: boolean;
}

/** The contact form follows the selected project type, not only the ?source it was seeded from. */
export function contactFlowFor(projectType: string): ContactFlow {
  if (projectType === TALK_PROJECT_TYPE) {
    return { nextSteps: TALK_NEXT_STEPS, note: "Sending this doesn’t reserve a date.", showTimeline: false };
  }
  return { nextSteps: GENERIC_NEXT_STEPS, showTimeline: true };
}
