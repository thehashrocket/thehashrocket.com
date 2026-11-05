import Link from "next/link";
import { getBookingUrl, getContactHref } from "@/lib/site";

export const primaryButton =
  "inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-6 py-2.5 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]";

export const secondaryButton =
  "inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]";

/** Primary CTA: books a call, or links to the contact form when Cal.com is unset. */
export function BookingLink({ source }: { source?: string }) {
  const bookingUrl = getBookingUrl(source);

  if (!bookingUrl) {
    return (
      <Link href={getContactHref(source)} className={primaryButton}>
        Start a conversation
      </Link>
    );
  }

  return (
    <a
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={primaryButton}
    >
      Book a 20-minute call
    </a>
  );
}
