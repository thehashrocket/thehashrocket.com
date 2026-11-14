import Link from "next/link";
import { getBookingUrl, getContactHref } from "@/lib/site";
import { BookingAnchor } from "./BookingAnchor";

export const primaryButton =
  "inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-6 py-2.5 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]";

export const secondaryButton =
  "inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]";

interface BookingLinkProps {
  source?: string;
  /** Set only on a page's hero CTA, never inside ClosingCta, so each page has one. */
  testId?: string;
  /**
   * Without Cal.com: "contact" (default) links to the form instead; "hide" renders
   * nothing, for call sites that already show their own message link.
   */
  fallback?: "contact" | "hide";
  /** "primary" (default) or "secondary" button style, for both the booking and fallback links. */
  variant?: "primary" | "secondary";
  /** Overrides "Book a 20-minute call". The contact fallback keeps "Start a conversation". */
  label?: string;
}

/** Books a call, or links to the contact form when Cal.com is unset. */
export function BookingLink({
  source,
  testId,
  fallback = "contact",
  variant = "primary",
  label = "Book a 20-minute call",
}: BookingLinkProps) {
  const bookingUrl = getBookingUrl(source);
  const className = variant === "primary" ? primaryButton : secondaryButton;

  if (!bookingUrl) {
    if (fallback === "hide") return null;
    return (
      <Link href={getContactHref(source)} className={className} data-testid={testId}>
        Start a conversation
      </Link>
    );
  }

  return (
    <BookingAnchor href={bookingUrl} source={source} className={className} testId={testId}>
      {label}
    </BookingAnchor>
  );
}
