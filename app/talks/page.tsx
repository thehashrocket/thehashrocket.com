import type { Metadata } from "next";
import Link from "next/link";
import { DimCanvasBelow } from "@/components/ui/DimCanvasBelow";
import { NumberedSteps } from "@/components/ui/NumberedSteps";
import { OfferHeroActions } from "@/components/ui/OfferHeroActions";
import { primaryButton } from "@/components/ui/BookingLink";
import { accentLink, eyebrow, inlineLink, section, sectionHeading } from "@/components/ui/styles";
import { talkFormat, talkScope } from "@/lib/offer-content";
import { TALK_MINUTES_MAX, TALK_MINUTES_MIN } from "@/lib/offers";
import { getContactHref } from "@/lib/site";
import { TALK_TAKEAWAYS, TALK_TITLE } from "@/lib/talk";

const SOURCE = "talks";
const ASK_LABEL = "Ask about a date";
const PAGE_URL = "https://www.jasonshultz.com/talks";
const DESCRIPTION = `${TALK_TITLE}: a free ${TALK_MINUTES_MIN}–${TALK_MINUTES_MAX} minute talk for chambers, SBDCs and business groups in the Sacramento, Stockton and Modesto areas, or online.`;

export const metadata: Metadata = {
  title: "A free talk for your group",
  description: DESCRIPTION,
  openGraph: {
    url: PAGE_URL,
  },
};

export default function TalksPage() {
  const contactHref = getContactHref(SOURCE);
  return (
    <div className="relative">
      {/* Hero */}
      <section className="px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-[720px]">
          <p className={eyebrow}>Free talk</p>
          <h1 className="font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
            {TALK_TITLE}
          </h1>
          <p data-testid="offer-summary" className="mt-6 font-mono text-sm text-[var(--text-primary)] tabular-nums">
            <span className="text-[var(--accent)]">Free</span> &middot; {TALK_MINUTES_MIN}–{TALK_MINUTES_MAX} min
            &middot; for chambers, SBDCs and business groups
          </p>
          <p data-testid="offer-scope" className="mt-6 text-xl leading-relaxed text-[var(--text-secondary)]">
            {talkScope}
          </p>
          <OfferHeroActions
            source={SOURCE}
            lead="message"
            messageLabel={ASK_LABEL}
            bookingLabel="Or book a call to plan it"
          />
        </div>
      </section>
      <DimCanvasBelow />

      <section className={section}>
        <div className="mx-auto max-w-[720px]">
          <h2 className={sectionHeading}>What attendees leave with</h2>
          <NumberedSteps steps={TALK_TAKEAWAYS} />
          <p className="mt-12 font-mono text-sm text-[var(--text-muted)]">{talkFormat}</p>
          <p className="mt-8 text-lg leading-relaxed text-[var(--text-secondary)]">
            I build and fix automations for small businesses.{" "}
            <Link href="/work/automation-rescue" className={inlineLink}>
              Here&apos;s one that broke and how I fixed it →
            </Link>
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
            In-house team workshops are available on request.{" "}
            <Link href={contactHref} className={inlineLink}>
              Ask about one →
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[720px]">
          <h2 className={sectionHeading}>Have a date in mind?</h2>
          <p className="mt-6 max-w-xl text-lg text-[var(--text-secondary)]">
            Tell me about your group, the likely date and roughly how many people. Sending a message doesn&apos;t
            commit you to anything.
          </p>
          <Link href={contactHref} className={`mt-10 ${primaryButton}`}>
            {ASK_LABEL}
          </Link>
          <div className="mt-12">
            <Link href="/automation-sprint" className={accentLink}>
              Rather have it done for you? See the automation sprint →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
