import type { Metadata } from "next";
import Link from "next/link";
import { FAQJsonLd } from "@/components/layout/LocationJsonLd";
import { ServiceJsonLd } from "@/components/layout/JsonLd";
import { FAQSection } from "@/components/ui/geo/FAQSection";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { DimCanvasBelow } from "@/components/ui/DimCanvasBelow";
import { OfferHeroActions } from "@/components/ui/OfferHeroActions";
import { NumberedSteps } from "@/components/ui/NumberedSteps";
import { accentLink, eyebrow, listItem, section, sectionHeading } from "@/components/ui/styles";
import { caseStudies } from "@/lib/case-studies";
import {
  sprintExamples,
  sprintExclusion,
  sprintFaqs,
  sprintPrerequisites,
  sprintSteps,
  sprintTerms,
} from "@/lib/offer-content";
import {
  SPRINT_MAX_SYSTEMS,
  SPRINT_MONTHLY_CAP,
  SPRINT_PRICE_MAX,
  SPRINT_PRICE_MIN,
  SPRINT_WEEKS,
  capLine,
  formatSprintPrice,
} from "@/lib/offers";

const SOURCE = "automation-sprint";
const PAGE_URL = "https://www.jasonshultz.com/automation-sprint";
const PRICE = formatSprintPrice();
const DESCRIPTION = `One painful process in your business, automated in ${SPRINT_WEEKS} weeks for a fixed price set before work starts: ${PRICE}.`;

export const metadata: Metadata = {
  title: "Automation sprint",
  description: DESCRIPTION,
  openGraph: {
    url: PAGE_URL,
  },
};


export default function AutomationSprintPage() {
  const cap = capLine(SPRINT_MONTHLY_CAP, "sprints");
  return (
    <div className="relative">
      <ServiceJsonLd
        name="Automation sprint"
        description={DESCRIPTION}
        url={PAGE_URL}
        offer={{ kind: "range", low: SPRINT_PRICE_MIN, high: SPRINT_PRICE_MAX }}
      />
      <FAQJsonLd faqs={sprintFaqs} />

      {/* Hero */}
      <section className="px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-[720px]">
          <p className={eyebrow}>Automation sprint</p>
          <h1 className="font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
            One process, automated.
          </h1>
          <p data-testid="offer-summary" className="mt-6 font-mono text-sm text-[var(--text-primary)] tabular-nums">
            <span className="text-[var(--accent)]">{PRICE}</span> &middot; fixed before work starts &middot;{" "}
            {SPRINT_WEEKS} weeks
          </p>
          <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
            Price depends on how many systems the process touches, up to {SPRINT_MAX_SYSTEMS}.
          </p>
          <p data-testid="offer-scope" className="mt-6 text-xl leading-relaxed text-[var(--text-secondary)]">
            Pick the one process that eats the most hours. I automate it, and we agree up front on the one result
            that means it&apos;s done.
          </p>
          <OfferHeroActions source={SOURCE} />
        </div>
      </section>
      <DimCanvasBelow />

      {/* Examples, each next to the work that backs it */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>The kind of process</p>
          <h2 className={`max-w-3xl ${sectionHeading}`}>Work I&apos;ve already done</h2>
          <ul className="mt-10 flex max-w-[720px] flex-col gap-10">
            {sprintExamples.map((example) => {
              const study = caseStudies[example.proofSlug];
              return (
                <li key={example.title} className="flex flex-col">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--text-primary)]">{example.title}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--text-secondary)]">{example.body}</p>
                  {study && (
                    <Link href={`/work/${study.slug}`} className={accentLink}>
                      {study.title} →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className={sectionHeading}>How it works</h2>
          <NumberedSteps steps={sprintSteps} />
        </div>
      </section>

      {/* Terms */}
      <section className={section}>
        <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-2">
          <div>
            <h2 className={sectionHeading}>What I need from you</h2>
            <ul className="mt-8 flex flex-col gap-4">
              {sprintPrerequisites.map((line) => (
                <li key={line} className={listItem}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--text-primary)]">Terms</h2>
            <ul className="mt-4 flex flex-col gap-3 text-[var(--text-secondary)]">
              {sprintTerms.map((line) => (
                <li key={line}>{line}</li>
              ))}
              {cap && <li>{cap}</li>}
            </ul>
            <p className="mt-6 border-l-2 border-[var(--accent)] pl-4 text-[var(--text-primary)]">
              {sprintExclusion}
            </p>
          </div>
        </div>
      </section>

      <FAQSection faqs={sprintFaqs} />

      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <ClosingCta
            heading="Which process would you hand off first?"
            body="Tell me what it is and which tools it touches. I'll tell you whether it fits a sprint, or what would fit better."
            source={SOURCE}
          />
        </div>
      </section>
    </div>
  );
}
