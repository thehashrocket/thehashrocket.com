import type { Metadata } from "next";
import Link from "next/link";
import { FAQJsonLd } from "@/components/layout/LocationJsonLd";
import { ArchitectureDiagram } from "@/components/ui/ArchitectureDiagram";
import { BookingLink, secondaryButton } from "@/components/ui/BookingLink";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { FAQSection } from "@/components/ui/geo/FAQSection";
import { caseStudies } from "@/lib/case-studies";
import {
  PRINT_SHOP_SOURCE,
  printShopFaqs,
  printShopFeatures,
  printShopHero,
  printShopPaths,
  printShopPathsNote,
} from "@/lib/print-shops";
import { getContactHref } from "@/lib/site";

const SOURCE = PRINT_SHOP_SOURCE;
const study = caseStudies["print-portal"];

export const metadata: Metadata = {
  title: "Software for print shops",
  description:
    `Get your print shop off paper job tickets: live department queues, online proofs, and QuickBooks that syncs itself. Built for a print shop that now handles ${study.results[0]} through it.`,
  openGraph: {
    url: "https://www.jasonshultz.com/print-shops",
  },
};

const eyebrow = "mb-2 font-mono text-sm text-[var(--accent)]";
const sectionHeading =
  "font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl";
const section = "border-t border-[var(--border)] px-6 py-16 md:py-24";

export default function PrintShopsPage() {
  return (
    <div className="relative">
      <FAQJsonLd faqs={printShopFaqs} />

      {/* Hero */}
      <section className="px-6 pt-32 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>For print shops</p>
          <h1 className="max-w-4xl font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
            {printShopHero.headline}
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-[var(--text-secondary)]">
            {printShopHero.subline}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <BookingLink source={SOURCE} />
            <Link href={getContactHref(SOURCE)} className={secondaryButton}>
              Send a message
            </Link>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section aria-labelledby="print-proof" className={section}>
        <div className="mx-auto max-w-[1280px]">
          <h2 id="print-proof" className="font-mono text-sm text-[var(--text-secondary)]">
            One print shop, after rollout:
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {study.results.map((result) => (
              <li key={result} className="font-mono text-2xl text-[var(--accent)] tabular-nums">
                {result}
              </li>
            ))}
          </ul>
          <Link
            href="/work/print-portal"
            className="mt-8 inline-flex min-h-[44px] items-center font-mono text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            Read the case study →
          </Link>
        </div>
      </section>

      {/* Workflow */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className={sectionHeading}>Every job, one path</h2>
          <p className="mt-4 max-w-[720px] text-lg text-[var(--text-secondary)]">
            Each step is created from the one before it, so nothing gets retyped between the counter and the books.
          </p>
          <ArchitectureDiagram
            title={study.title}
            steps={study.diagram}
            accent={study.accent}
            className="mt-10 hidden rounded-[var(--radius-md)] md:block"
          />
          <ol className="mt-8 flex flex-col gap-3 md:hidden">
            {study.diagram.map((step, i) => (
              <li key={step} className="flex gap-4 text-lg text-[var(--text-primary)]">
                <span aria-hidden="true" className="font-mono text-sm text-[var(--accent)]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Configure, connect, or build */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className={sectionHeading}>Configure, connect, or build</h2>
          <p className="mt-4 max-w-[720px] text-lg text-[var(--text-secondary)]">{printShopPathsNote}</p>
          <div className="mt-10 flex flex-col">
            {printShopPaths.map((row) => (
              <div key={row.path} className="grid gap-4 border-t border-[var(--border)] py-8 md:grid-cols-[1fr_3fr]">
                <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)]">{row.path}</h3>
                <dl className="grid gap-4 md:grid-cols-3">
                  <div>
                    <dt className="font-mono text-xs text-[var(--text-muted)]">Best fit</dt>
                    <dd className="mt-1 text-[var(--text-secondary)]">{row.bestFit}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-[var(--text-muted)]">Disruption</dt>
                    <dd className="mt-1 text-[var(--text-secondary)]">{row.disruption}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-[var(--text-muted)]">Ongoing ownership</dt>
                    <dd className="mt-1 text-[var(--text-secondary)]">{row.ownership}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In your shop */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className={sectionHeading}>What this looks like in your shop</h2>
          <ul className="mt-10 flex max-w-[720px] flex-col gap-4">
            {printShopFeatures.map((feature) => (
              <li
                key={feature}
                className="border-l-2 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--text-secondary)]"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQSection faqs={printShopFaqs} />

      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <ClosingCta
            heading="Where do jobs get stuck in your shop?"
            body="Tell me how a job moves from quote to invoice today. I'll tell you whether to configure, connect, or build, even when the answer isn't me."
            source="print-shops"
          />
        </div>
      </section>
    </div>
  );
}
