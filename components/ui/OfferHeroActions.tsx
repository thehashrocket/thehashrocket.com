import Link from "next/link";
import { getBookingUrl, getContactHref } from "@/lib/site";
import { BookingLink, primaryButton, secondaryButton } from "./BookingLink";

/**
 * An offer page's hero actions. Exactly one element carries
 * data-testid="booking-cta", whether or not Cal.com is configured:
 *
 *   booking on  → [Book a 20-minute call]* [Send a message]
 *   booking off → [Send a message]*
 *
 * (* = booking-cta). ClosingCta further down the page never carries the testid.
 */
export function OfferHeroActions({ source }: { source: string }) {
  const hasBooking = getBookingUrl(source) !== null;
  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      <BookingLink source={source} testId="booking-cta" fallback="hide" />
      <Link
        href={getContactHref(source)}
        className={hasBooking ? secondaryButton : primaryButton}
        data-testid={hasBooking ? undefined : "booking-cta"}
      >
        Send a message
      </Link>
    </div>
  );
}
