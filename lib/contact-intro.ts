// What /contact says above the form, by allow-listed source. Kept out of the
// page module because app-router pages may only export page fields.
import { REVIEW_PROJECT_TYPE, SPRINT_PROJECT_TYPE, type ProjectType } from "@/lib/contact-options";
import { REVIEW_TURNAROUND, formatReviewPrice, formatSprintPrice, offerLadderText } from "@/lib/offers";

const GENERIC_OPENING = "Tell me what's broken or what you need.";

export interface ContactIntro {
  /** The intro paragraph. */
  text: string;
  /**
   * A second, emphasized line naming the page the visitor came from. Worded as where they
   * came from, not what they want, so it stays true when they pick a different type.
   */
  context?: string;
  /**
   * The offer's price and terms. ContactForm shows them only while the selected
   * project type is still `termsType`, so a visitor who switches offers never sees
   * the wrong price.
   */
  terms?: { text: string; termsType: ProjectType };
}

/** Offer sources name their offer instead of repeating the price list; talk sources show no prices. */
export function contactIntro(source: string | undefined): ContactIntro {
  switch (source) {
    case "ai-app-review":
      return {
        text: GENERIC_OPENING,
        context: "You came from the AI-built app review page.",
        terms: {
          text: `It's a flat ${formatReviewPrice()}, with the written report within ${REVIEW_TURNAROUND}.`,
          termsType: REVIEW_PROJECT_TYPE,
        },
      };
    case "automation-sprint":
      return {
        text: GENERIC_OPENING,
        context: "You came from the automation sprint page.",
        terms: {
          text: `It's ${formatSprintPrice()}, fixed before work starts.`,
          termsType: SPRINT_PROJECT_TYPE,
        },
      };
    case "care-plan":
      return {
        text: GENERIC_OPENING,
        context: "You're asking about ongoing support. Tell me what you run and how it's looked after today.",
      };
    case "talks":
      return {
        text: "Tell me about your group, the likely date and roughly how many people.",
        context: "You came from the talks page.",
      };
    case "talk-attendee":
      return { text: "Heard me speak? Tell me which job you'd hand off first." };
    default:
      return { text: `${GENERIC_OPENING} ${offerLadderText()}` };
  }
}
