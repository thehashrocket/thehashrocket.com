import type { Metadata } from "next";
import Link from "next/link";
import { FAQJsonLd } from "@/components/layout/LocationJsonLd";
import { ServiceJsonLd } from "@/components/layout/JsonLd";
import { FAQSection } from "@/components/ui/geo/FAQSection";
import { BookingLink, secondaryButton } from "@/components/ui/BookingLink";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { caseStudies } from "@/lib/case-studies";
import {
  REVIEW_CREDIT_TEXT,
  REVIEW_MONTHLY_CAP,
  REVIEW_PRICE,
  REVIEW_TURNAROUND,
  formatReviewPrice,
  reviewChecks,
  reviewDeliverables,
  reviewFaqs,
  reviewIsNot,
  reviewScope,
  reviewSteps,
  scannerQuestions,
} from "@/lib/offers";
import { getContactHref } from "@/lib/site";

const SOURCE = "ai-app-review";
const PAGE_URL = "https://www.jasonshultz.com/ai-app-review";
const DESCRIPTION = `A fixed-fee review of one app built with AI or inherited from someone else: what's risky, what to fix first, and whether to fix, rebuild or replace it. ${formatReviewPrice()}, ${REVIEW_TURNAROUND}.`;

export const metadata: Metadata = {
  title: "AI-built app review",
  description: DESCRIPTION,
  openGraph: {
    url: PAGE_URL,
  },
};

const RELATED_SLUGS = ["fleet-security-audit", "automation-rescue"];
const related = RELATED_SLUGS.flatMap((slug) => caseStudies[slug] ?? []);

const eyebrow = "mb-2 font-mono text-sm text-[var(--accent)]";
const sectionHeading =
  "font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl";
const section = "border-t border-[var(--border)] px-6 py-16 md:py-24";
const listItem = "border-l-2 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--text-secondary)]";

export default function AiAppReviewPage() {
  return (
    <div className="relative">
      <ServiceJsonLd name="AI-built app review" description={DESCRIPTION} url={PAGE_URL} price={REVIEW_PRICE} />
      <FAQJsonLd faqs={reviewFaqs} />

      {/* Hero */}
      <section className="px-6 pt-32 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>AI-built app review</p>
          <h1 className="max-w-4xl font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
            Find out what&apos;s risky in the app your team built with AI.
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-[var(--text-secondary)]">
            For owners whose business now runs on an app someone built with AI tools, or inherited from someone who
            left, and nobody can say what&apos;s holding it together.
          </p>
          <p className="mt-6 font-mono text-sm text-[var(--text-primary)] tabular-nums">
            <span className="text-[var(--accent)]">{formatReviewPrice()}</span> &middot; {REVIEW_TURNAROUND} &middot;
            fixed scope
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <BookingLink source={SOURCE} />
            <Link href={getContactHref(SOURCE)} className={secondaryButton}>
              Send a message
            </Link>
          </div>
        </div>
      </section>

      {/* Judgment questions */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>The point of the review</p>
          <h2 className={`max-w-3xl ${sectionHeading}`}>Questions a scanner can&apos;t answer</h2>
          <ul className="mt-10 flex max-w-[720px] flex-col gap-4">
            {scannerQuestions.map((question) => (
              <li key={question} className={listItem}>
                {question}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Check / get */}
      <section className={section}>
        <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-2">
          <div>
            <h2 className={sectionHeading}>What I check</h2>
            <ul className="mt-8 flex flex-col gap-4">
              {reviewChecks.map((check) => (
                <li key={check} className={listItem}>
                  {check}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-sm text-[var(--text-muted)]">Automated scanning included.</p>
          </div>
          <div>
            <h2 className={sectionHeading}>What you get</h2>
            <ul className="mt-8 flex flex-col gap-4">
              {reviewDeliverables.map((item) => (
                <li key={item} className={listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What it isn't */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className={sectionHeading}>What it isn&apos;t</h2>
          <ul className="mt-8 flex max-w-[720px] flex-col gap-4">
            {reviewIsNot.map((item) => (
              <li key={item} className="text-lg leading-relaxed text-[var(--text-secondary)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it starts */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <h2 className={sectionHeading}>How it starts</h2>
          <ol className="mt-10 flex max-w-[720px] flex-col gap-8">
            {reviewSteps.map((step, i) => (
              <li key={step} className="flex gap-6">
                <span aria-hidden="true" className="font-mono text-sm text-[var(--accent)]">
                  {i + 1}
                </span>
                <p className="text-lg leading-relaxed text-[var(--text-secondary)]">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 max-w-[720px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">Scope</h3>
            <ul className="mt-4 flex flex-col gap-3 text-[var(--text-secondary)]">
              {reviewScope.map((line) => (
                <li key={line}>{line}</li>
              ))}
              {REVIEW_MONTHLY_CAP !== null && (
                <li>
                  I take {REVIEW_MONTHLY_CAP} reviews a month. Ask about the next available start. A booked call or
                  message confirms fit and timing; it doesn&apos;t reserve a slot.
                </li>
              )}
            </ul>
            <p className="mt-6 border-l-2 border-[var(--accent)] pl-4 text-[var(--text-primary)]">
              {REVIEW_CREDIT_TEXT}
            </p>
          </div>
        </div>
      </section>

      {/* Related work: plain links, so they work without WebGL */}
      <section className={section}>
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>Related work</p>
          <h2 className={`mb-10 ${sectionHeading}`}>Similar work</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {related.map((study) => (
              <Link
                key={study.slug}
                href={`/work/${study.slug}`}
                className="group flex flex-col rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]"
              >
                <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">{study.title}</h3>
                <p className="mt-2 text-[var(--text-secondary)]">{study.outcome}</p>
                <span className="mt-4 font-mono text-sm text-[var(--accent)]">Read the case study →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FAQSection faqs={reviewFaqs} />

      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <ClosingCta
            heading="Not sure it's safe to keep running?"
            body="Tell me what the app does and who built it. I'll tell you whether the review fits, or what would fit better."
            source="ai-app-review"
          />
        </div>
      </section>
    </div>
  );
}
