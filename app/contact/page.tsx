import type { Metadata } from "next";
import { BookingLink } from "@/components/ui/BookingLink";
import { ContactForm } from "@/components/ui/ContactForm";
import { CONTACT_EMAIL, getBookingUrl } from "@/lib/site";
import { projectTypeForSource } from "@/lib/contact-options";
import { formatReviewPrice } from "@/lib/offers";
import { normalizeSource } from "@/lib/sources";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Running on spreadsheets, duct tape, or software nobody wants to touch? Book a 20-minute call or send a message. Projects typically start at $10,000. Reply within one business day.",
  openGraph: {
    url: "https://www.jasonshultz.com/contact",
  },
};

const nextSteps = [
  "I reply within one business day.",
  "We do a 20-minute call.",
  "You get a written proposal or an honest “I’m not your guy.”",
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string | string[] }>;
}) {
  const source = normalizeSource((await searchParams).source);

  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">Contact</p>
        <h1 className="mb-4 font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl">
          Let&apos;s talk
        </h1>
        <p className="mb-8 text-lg text-[var(--text-secondary)]">
          Tell me what&apos;s broken or what you need. Projects typically start
          at $10,000. An AI-built app review is a flat {formatReviewPrice()}.
          Retainers are scoped to what you run.
        </p>
        {source === "ai-app-review" && (
          <p className="-mt-4 mb-8 text-lg text-[var(--text-primary)]">
            You&apos;re asking about the AI-built app review.
          </p>
        )}

        {/* Without Cal.com this link would point back at this page */}
        {getBookingUrl(source) && (
          <div className="mb-12">
            <BookingLink source={source} />
          </div>
        )}

        <h2 className="mb-4 font-mono text-sm text-[var(--accent)]">What happens next</h2>
        <ol className="mb-12 space-y-2 text-[var(--text-secondary)]">
          {nextSteps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span aria-hidden="true" className="font-mono text-sm text-[var(--text-muted)]">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <ContactForm
          key={source ?? "direct"}
          source={source}
          defaultProjectType={projectTypeForSource(source)}
        />

        <p className="mt-8 text-sm text-[var(--text-muted)]">
          Prefer email?{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex min-h-11 items-center text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
