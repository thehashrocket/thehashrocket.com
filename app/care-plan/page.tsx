import type { Metadata } from "next";
import Link from "next/link";
import { FAQJsonLd } from "@/components/layout/LocationJsonLd";
import { ServiceJsonLd } from "@/components/layout/JsonLd";
import { FAQSection } from "@/components/ui/geo/FAQSection";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { DimCanvasBelow } from "@/components/ui/DimCanvasBelow";
import { OfferHeroActions } from "@/components/ui/OfferHeroActions";
import {
  accentLink,
  eyebrow,
  heroFact,
  offerActionsSpacing,
  offerScope,
  offerSummary,
  section,
  sectionHeading,
} from "@/components/ui/styles";
import {
  careCoverage,
  careFaqs,
  careHoursOut,
  careOnboarding,
  careOnboardingRule,
  carePriceLine,
  careTerms,
  careTiers,
} from "@/lib/offer-content";
import {
  CARE_PLAN_MAX,
  CARE_PLAN_MAX_CLIENTS,
  CARE_PLAN_MIN,
  clientCapLine,
  formatCareHours,
  formatCarePrice,
} from "@/lib/offers";

const SOURCE = "care-plan";
const PAGE_URL = "https://www.jasonshultz.com/care-plan";
const PRICE = formatCarePrice();
const HOURS = formatCareHours();
const DESCRIPTION = `Monitoring, backups, updates, ${HOURS} hours of work each month and a same-business-day reply when something breaks. ${PRICE} a month, month to month.`;

export const metadata: Metadata = {
  title: "Care plan",
  description: DESCRIPTION,
  openGraph: {
    url: PAGE_URL,
  },
};

/** A subsection heading inside the single column: smaller than a page section's. */
const subheading = "font-display text-3xl md:text-[32px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]";

export default function CarePlanPage() {
  const cap = clientCapLine(CARE_PLAN_MAX_CLIENTS);
  return (
    <div className="relative">
      <ServiceJsonLd
        name="Care plan"
        description={DESCRIPTION}
        url={PAGE_URL}
        offer={{ kind: "monthly", low: CARE_PLAN_MIN, high: CARE_PLAN_MAX }}
      />
      <FAQJsonLd faqs={careFaqs} />

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 sm:pt-24 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-[720px]">
          <p className={eyebrow}>Care plan</p>
          <h1 className="font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
            Your systems, looked after.
          </h1>
          <p data-testid="offer-scope" className={offerScope}>
            Monitoring, backups, updates and a same-business-day reply when something breaks.
          </p>
          <p data-testid="offer-summary" className={offerSummary}>
            <span className="text-[var(--accent)]">{PRICE}/month</span> &middot; {HOURS} hours included
          </p>
          <OfferHeroActions source={SOURCE} spacing={offerActionsSpacing} />
        </div>
      </section>
      <DimCanvasBelow />

      {/* What's covered: plain divided rows, no cards (docs/DESIGN.md) */}
      <section className={section}>
        <div className="mx-auto max-w-[720px]">
          <h2 className={sectionHeading}>What&apos;s covered</h2>
          <ul className="mt-10 flex flex-col">
            {careCoverage.map((row) => (
              <li key={row.title} className="border-t border-[var(--border)] py-6">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--text-primary)]">{row.title}</h3>
                <p className="mt-2 leading-relaxed text-[var(--text-secondary)]">{row.body}</p>
                {row.note && <p className="mt-2 text-sm text-[var(--text-muted)]">{row.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The tiers, stated outright (#89) */}
      <section className={section}>
        <div className="mx-auto max-w-[720px]">
          <h2 className={sectionHeading}>What it costs</h2>
          <dl className="mt-10 flex flex-col" data-testid="care-tiers">
            {careTiers.map((tier) => (
              <div
                key={tier.systems}
                className="grid gap-1 border-t border-[var(--border)] py-5 sm:grid-cols-[200px_1fr_1fr] sm:gap-6"
              >
                <dt className="font-medium text-[var(--text-primary)]">{tier.systems}</dt>
                <dd className="font-mono text-[var(--text-primary)] tabular-nums">{tier.price}</dd>
                <dd className="text-[var(--text-secondary)]">{tier.hours}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-6 ${heroFact}`}>{carePriceLine}</p>
        </div>
      </section>

      <section className={section}>
        <div className="mx-auto flex max-w-[720px] flex-col gap-16">
          <div>
            <h2 className={subheading}>When hours run out</h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{careHoursOut}</p>
          </div>
          <div>
            <h2 className={subheading}>Before coverage starts</h2>
            <ul className="mt-6 flex flex-col">
              {careOnboarding.map((row) => (
                <li key={row.from} className="border-t border-[var(--border)] py-5">
                  <p className="font-medium text-[var(--text-primary)]">{row.from}</p>
                  <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">{row.detail}</p>
                  {row.href && (
                    <Link href={row.href} className={accentLink}>
                      {row.linkLabel}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <p className={`mt-4 ${heroFact}`}>{careOnboardingRule}</p>
          </div>
          <div>
            <h2 className={subheading}>Terms</h2>
            <dl className="mt-6 flex flex-col" data-testid="care-terms">
              {careTerms.map(({ term, detail }) => (
                <div
                  key={term}
                  className="grid gap-1 border-t border-[var(--border)] py-4 sm:grid-cols-[200px_1fr] sm:gap-6"
                >
                  <dt className="font-medium text-[var(--text-primary)]">{term}</dt>
                  <dd className="text-[var(--text-secondary)]">{detail}</dd>
                </div>
              ))}
            </dl>
            {cap && <p className={`mt-6 ${heroFact}`}>{cap}</p>}
          </div>
        </div>
      </section>

      <FAQSection faqs={careFaqs} />

      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[720px]">
          <Link href="/automation-sprint" className={accentLink}>
            Nothing running yet? Start with the automation sprint →
          </Link>
          <div className="mt-12">
            <ClosingCta
              heading="Want it looked after?"
              body="Tell me what you run and how it's looked after today. I'll tell you where in the range it lands."
              source={SOURCE}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
