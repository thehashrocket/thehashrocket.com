import Link from "next/link";
import { getBookingUrl, getContactHref } from "@/lib/site";
import { BookingLink, secondaryButton } from "./BookingLink";

interface ClosingCtaProps {
  heading?: string;
  body?: string;
  source?: string;
}

export function ClosingCta({
  heading = "Got a system nobody wants to touch?",
  body = "A legacy platform held together with tape, a business still running on spreadsheets, or infrastructure everyone's afraid to restart. I've been handed all three. Tell me what you're dealing with.",
  source,
}: ClosingCtaProps) {
  return (
    <>
      <h2 className="mb-6 font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl">
        {heading}
      </h2>
      <p className="mb-10 max-w-xl text-lg text-[var(--text-secondary)]">
        {body}
      </p>
      <div className="flex flex-wrap gap-4">
        <BookingLink source={source} />
        {/* Without Cal.com the primary button already goes to the form */}
        {getBookingUrl(source) && (
          <Link href={getContactHref(source)} className={secondaryButton}>
            Send a message
          </Link>
        )}
      </div>
    </>
  );
}
