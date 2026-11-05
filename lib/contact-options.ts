// Shared by ContactForm (client) and submitContact (server), so keep this free
// of imports that would pull site data into the client bundle.
export const PROJECT_TYPES = [
  "New build",
  "Rescue",
  "Ongoing support",
  "Not sure",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "1–3 months",
  "3–6 months",
  "Just exploring",
] as const;
