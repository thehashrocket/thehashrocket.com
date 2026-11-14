// What /contact says above the form, by allow-listed source. Kept out of the
// page module because app-router pages may only export page fields.
import { REVIEW_TURNAROUND, formatReviewPrice, formatSprintPrice, offerLadderText } from "@/lib/offers";

const GENERIC_OPENING = "Tell me what's broken or what you need.";

export interface ContactIntro {
  /** The intro paragraph. */
  text: string;
  /** A second, emphasized line naming what the visitor came about. */
  context?: string;
}

/** Offer sources name their offer instead of repeating the price list; talk sources show no prices. */
export function contactIntro(source: string | undefined): ContactIntro {
  switch (source) {
    case "ai-app-review":
      return {
        text: GENERIC_OPENING,
        context: `You're asking about the AI-built app review. It's a flat ${formatReviewPrice()}, with the written report within ${REVIEW_TURNAROUND}.`,
      };
    case "automation-sprint":
      return {
        text: GENERIC_OPENING,
        context: `You're asking about the automation sprint. It's ${formatSprintPrice()}, fixed before work starts.`,
      };
    case "care-plan":
      return {
        text: GENERIC_OPENING,
        context: "You're asking about ongoing support. Tell me what you run and how it's looked after today.",
      };
    case "talks":
      return {
        text: "Tell me about your group, the likely date and roughly how many people.",
        context: "You're asking about a talk for your group.",
      };
    case "talk-attendee":
      return { text: "Heard me speak? Tell me which job you'd hand off first." };
    default:
      return { text: `${GENERIC_OPENING} ${offerLadderText()}` };
  }
}
