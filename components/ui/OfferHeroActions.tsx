import Link from "next/link";
import { getBookingUrl, getContactHref } from "@/lib/site";
import { BookingLink, primaryButton, secondaryButton } from "./BookingLink";

interface OfferHeroActionsProps {
  source: string;
  /** Which action leads. "booking" (default) suits paid offers; "message" suits asks like a talk date. */
  lead?: "booking" | "message";
  /** The message link's text. */
  messageLabel?: string;
  /** The booking link's text when Cal.com is configured. */
  bookingLabel?: string;
}

/**
 * An offer page's hero actions. Exactly one element carries
 * data-testid="booking-cta" (the hero's primary action, even when it opens the
 * contact form), whether or not Cal.com is configured:
 *
 *   lead="booking", booking on  → [Book a 20-minute call]* [Send a message]
 *   lead="booking", booking off → [Send a message]*
 *   lead="message", booking on  → [Send a message]* [Book a 20-minute call]
 *   lead="message", booking off → [Send a message]*
 *
 * (* = booking-cta, primary style; the other is secondary). Labels shown are the
 * defaults. ClosingCta further down the page never carries the testid.
 */
export function OfferHeroActions({
  source,
  lead = "booking",
  messageLabel = "Send a message",
  bookingLabel,
}: OfferHeroActionsProps) {
  const hasBooking = getBookingUrl(source) !== null;
  const messageLeads = lead === "message" || !hasBooking;
  const message = (
    <Link
      href={getContactHref(source)}
      className={messageLeads ? primaryButton : secondaryButton}
      data-testid={messageLeads ? "booking-cta" : undefined}
    >
      {messageLabel}
    </Link>
  );

  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      {lead === "message" ? (
        <>
          {message}
          <BookingLink source={source} fallback="hide" variant="secondary" label={bookingLabel} />
        </>
      ) : (
        <>
          <BookingLink source={source} testId="booking-cta" fallback="hide" label={bookingLabel} />
          {message}
        </>
      )}
    </div>
  );
}
