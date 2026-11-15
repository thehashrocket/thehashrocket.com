// Shared Tailwind class strings for page sections, so the homepage and the
// offer pages stay visually identical without copying constants.

export const eyebrow = "mb-2 font-mono text-sm text-[var(--accent)]";

export const sectionHeading =
  "font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl";

/** A bordered page section with the offer pages' vertical rhythm. */
export const section = "border-t border-[var(--border)] px-6 py-16 md:py-24";

/** A list row with the accent rule on the left. */
export const listItem =
  "border-l-2 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--text-secondary)]";

/** A standalone mono link ("See all case studies →"), sized as a touch target. */
export const accentLink =
  "inline-flex min-h-[44px] items-center font-mono text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]";

/** The offer heroes' fit sentence, right under the H1. Smaller and tighter below `sm` so the hero fits a small phone. */
export const offerScope =
  "mt-4 max-w-xl text-lg leading-snug text-[var(--text-secondary)] sm:mt-6 sm:text-xl sm:leading-relaxed";

/**
 * The offer heroes' price line: the largest fact in the block. Mono because it leads with
 * the price (numeric data); its short terms ("fixed scope") ride along on purpose.
 */
export const offerSummary = "mt-4 font-mono text-lg text-[var(--text-primary)] tabular-nums sm:mt-6";

/** Space between the last hero fact and the buttons on the offer pages. */
export const offerActionsSpacing = "mt-4 sm:mt-8";

/**
 * A buyer fact: a sentence about price conditions, scope limits, location or format,
 * timing, capacity or how to reach me. Body size in secondary text, never mono fine
 * print (docs/DESIGN.md, Typography). Labels and eyebrows stay mono. No margin: each
 * use sets its own, so two margin utilities never compete on one element.
 */
export const heroFact = "max-w-xl text-base leading-relaxed text-[var(--text-secondary)]";

/** A link inside running text: always underlined, so it never relies on color alone (WCAG 1.4.1). */
export const inlineLink = "text-[var(--accent)] underline underline-offset-4 transition-colors hover:text-[var(--accent-hover)]";
