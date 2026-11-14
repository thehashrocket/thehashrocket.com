// The /talks title and takeaways. A leaf module (no imports) so the e2e spec and
// unit tests can import the exact strings the page renders.
//
// The owner writes TALK_TITLE and checks it with one organizer before merge.
// It is the page's H1, so keep it to 60 characters (test/talk.test.ts) and
// re-check the 375×560 first screen after changing it.

export const TALK_TITLE = "Automate one admin job without breaking things";

/** "What attendees leave with", in order. */
export const TALK_TAKEAWAYS = [
  "Which admin job to hand off first, and which ones to leave alone for now.",
  "How to set it up with a person checking the work before anything reaches a customer.",
  "How to tell when an automation is quietly failing, before your customers notice.",
];
