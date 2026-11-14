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

/** A link inside running text. */
export const inlineLink = "text-[var(--accent)] underline-offset-4 hover:underline";
