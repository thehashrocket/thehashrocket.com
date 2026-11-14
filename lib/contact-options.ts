// Shared by ContactForm (client) and submitContact (server), so keep this free
// of imports that would pull site data into the client bundle.
export const PROJECT_TYPES = [
  "New build",
  "Automation sprint",
  "Rescue",
  "AI-built app review",
  "Ongoing support",
  "Not sure",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "1–3 months",
  "3–6 months",
  "Just exploring",
] as const;

/** Preselects the form's project type for visitors arriving from an offer page. Still editable. */
export const PROJECT_TYPE_BY_SOURCE = {
  "ai-app-review": "AI-built app review",
  "automation-sprint": "Automation sprint",
  "care-plan": "Ongoing support",
  "print-shops": "New build",
} satisfies Partial<Record<string, (typeof PROJECT_TYPES)[number]>>;

export function projectTypeForSource(
  source: string | undefined,
): (typeof PROJECT_TYPES)[number] | undefined {
  if (!source || !Object.hasOwn(PROJECT_TYPE_BY_SOURCE, source)) return undefined;
  return PROJECT_TYPE_BY_SOURCE[source as keyof typeof PROJECT_TYPE_BY_SOURCE];
}
