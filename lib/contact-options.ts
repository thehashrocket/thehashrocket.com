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

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const SPRINT_PROJECT_TYPE = "Automation sprint" satisfies ProjectType;
export const REVIEW_PROJECT_TYPE = "AI-built app review" satisfies ProjectType;
export const TALK_PROJECT_TYPE = "A talk for my group" satisfies ProjectType;

/** Preselects the form's project type for visitors arriving from an offer page. Still editable. */
export const PROJECT_TYPE_BY_SOURCE = {
  "ai-app-review": REVIEW_PROJECT_TYPE,
  "automation-sprint": SPRINT_PROJECT_TYPE,
  "care-plan": "Ongoing support",
  "print-shops": "New build",
  talks: TALK_PROJECT_TYPE,
} satisfies Partial<Record<string, ProjectType>>;

export function projectTypeForSource(source: string | undefined): ProjectType | undefined {
  if (!source || !Object.hasOwn(PROJECT_TYPE_BY_SOURCE, source)) return undefined;
  return PROJECT_TYPE_BY_SOURCE[source as keyof typeof PROJECT_TYPE_BY_SOURCE];
}

export type FlowKind = "generic" | "sprint" | "review" | "talk";

/**
 * Which "What happens next" each option gets. A Record over every option, so adding
 * a project type without choosing its flow fails the type check.
 */
export const FLOW_BY_PROJECT_TYPE = {
  "New build": "generic",
  "Automation sprint": "sprint",
  Rescue: "generic",
  "AI-built app review": "review",
  "Ongoing support": "generic",
  "A talk for my group": "talk",
  "Not sure": "generic",
} as const satisfies Record<ProjectType, FlowKind>;

export interface ContactFlow {
  /** "What happens next", in order. */
  nextSteps: readonly string[];
  /** A line under the steps, if any. */
  note?: string;
  /** Project timelines mean nothing to someone booking a talk. The server treats timeline as optional. */
  showTimeline: boolean;
}

const FLOWS: Record<FlowKind, ContactFlow> = {
  generic: {
    nextSteps: [
      "I reply within one business day.",
      "We do a 20-minute call.",
      "You get a written proposal or an honest “I’m not your guy.”",
    ],
    showTimeline: true,
  },
  sprint: {
    nextSteps: [
      "I reply within one business day.",
      "We do a 20-minute call about the process.",
      "You get a one-page scope with a fixed price and one success metric, or an honest “this isn’t a sprint.”",
    ],
    showTimeline: true,
  },
  review: {
    nextSteps: [
      "I reply within one business day.",
      "We do a 20-minute call to confirm the app fits the review’s scope.",
      "You get a start date, the access checklist and a time for the 30-minute walkthrough.",
    ],
    showTimeline: true,
  },
  talk: {
    nextSteps: [
      "I reply within one business day.",
      "We pick a date and a format.",
      "I send a short outline for your group.",
    ],
    note: "Sending this doesn’t reserve a date.",
    showTimeline: false,
  },
};

export function flowKindFor(projectType: string): FlowKind {
  return Object.hasOwn(FLOW_BY_PROJECT_TYPE, projectType)
    ? FLOW_BY_PROJECT_TYPE[projectType as ProjectType]
    : "generic";
}

/** The contact form follows the selected project type, not only the ?source it was seeded from. */
export function contactFlowFor(projectType: string): ContactFlow {
  return FLOWS[flowKindFor(projectType)];
}
