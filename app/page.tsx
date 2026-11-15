import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AtlasCard } from "@/components/ui/AtlasCard";
import { BookingLink, secondaryButton } from "@/components/ui/BookingLink";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { FocusOnHash } from "@/components/ui/FocusOnHash";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { accentLink, eyebrow, inlineLink, sectionHeading } from "@/components/ui/styles";
import { getCaseStudySummaries } from "@/lib/case-studies";
import {
  REVIEW_TURNAROUND,
  SPRINT_WEEKS,
  TALK_MINUTES_MAX,
  TALK_MINUTES_MIN,
  formatCarePrice,
  formatReviewPrice,
  formatSprintPrice,
  offerLadderParts,
} from "@/lib/offers";

export const metadata: Metadata = {
  openGraph: {
    url: "https://www.jasonshultz.com",
  },
};

const FEATURED_SLUGS = [
  "print-portal",
  "pharma-wms",
  "storefront-consolidation",
  "fleet-security-audit",
];

const summaries = new Map(getCaseStudySummaries().map((study) => [study.slug, study]));
const featuredStudies = FEATURED_SLUGS.flatMap((slug) => summaries.get(slug) ?? []);

const proofPoints = [
  { value: "$200M+", label: "a year in pharma distribution runs on a system I built" },
  { value: "125", label: "sites audited, servers hardened" },
  { value: "9 → 1", label: "storefronts consolidating into one platform" },
  { value: "20+", label: "years shipping production software" },
];


/**
 * One card per offer page (#100, #107). The nav's Services link lands here, and every
 * OFFER_ROUTES page must have a card (test/e2e/site-structure.spec.ts). Priced offers
 * lead; prices come from lib/offers.ts. `span` lays the cards out asymmetrically on
 * large screens (docs/DESIGN.md: no uniform card grids): the sprint leads the first row.
 */
const serviceChoices: { href: string; name: string; price: string; body: string; cta: string; span: string }[] = [
  {
    href: "/automation-sprint",
    name: "Automation sprint",
    price: formatSprintPrice(),
    body: `The one process that eats the most hours, automated in ${SPRINT_WEEKS} weeks for a price fixed before work starts.`,
    cta: "See the sprint",
    span: "md:col-span-2 lg:col-span-6",
  },
  {
    href: "/ai-app-review",
    name: "AI-built app review",
    price: formatReviewPrice(),
    body: `What's risky in an app someone built with AI, in a written report within ${REVIEW_TURNAROUND}.`,
    cta: "See the review",
    span: "lg:col-span-3",
  },
  {
    href: "/care-plan",
    name: "Care plan",
    price: `${formatCarePrice()} a month`,
    body: "Monitoring, backups, updates and a same-business-day reply for what you already run.",
    cta: "See the care plan",
    span: "lg:col-span-3",
  },
  {
    href: "/talks",
    name: "Free talk",
    price: "Free",
    body: `A ${TALK_MINUTES_MIN}–${TALK_MINUTES_MAX} minute talk for your chamber, SBDC or business group.`,
    cta: "Ask about a date",
    span: "lg:col-span-6",
  },
  {
    href: "/print-shops",
    name: "Print shops",
    price: "Scoped to your shop",
    body: "The production portal that runs a print shop's every job, from quote to QuickBooks.",
    cta: "See the print-shop page",
    span: "lg:col-span-6",
  },
];

const services: { title: string; body: string; link?: { href: string; label: string } }[] = [
  {
    title: "Build it.",
    body: "Custom software that replaces the paper, the spreadsheets, and the six disconnected tools. Quotes, job tracking, inventory, production queues, invoicing, integrations with QuickBooks and whatever else you already pay for.",
    link: { href: "/automation-sprint", label: "See the automation sprint →" },
  },
  {
    title: "Rescue it.",
    body: "You inherited a system and the person who built it is long gone. Maybe it's a legacy app, a pile of WordPress sites, or an automation that worked great until it didn't. Or someone on your team built it with AI, it's running the business now, and nobody knows what's risky in it. I figure out what it actually does, tell you plainly what it'll take, and fix it.",
    link: { href: "/ai-app-review", label: "Get an AI-built app reviewed →" },
  },
  {
    title: "Keep it running.",
    body: "Servers, security, updates, backups, and a same-business-day reply when something breaks. Ongoing support on a monthly plan, so you have an engineer before you need one.",
    link: { href: "/care-plan", label: "See the care plan →" },
  },
];


const steps: { title: string; body: ReactNode }[] = [
  {
    title: "A 20-minute call.",
    body: "You tell me what's broken or what you need. I tell you honestly whether I'm the right fit.",
  },
  {
    title: "A fixed scope and price.",
    body: (
      <>
        One process to automate gets a one-page scope for an{" "}
        <Link href="/automation-sprint" className={inlineLink}>
          automation sprint
        </Link>
        . An app someone built with AI gets a{" "}
        <Link href="/ai-app-review" className={inlineLink}>
          fixed-fee review
        </Link>
        . Larger work starts with a paid discovery: I map what exists, find the real problems, and give you a written
        plan with estimates. You own the written result either way.
      </>
    ),
  },
  {
    title: "Build, hand off, look after.",
    body: (
      <>
        The work ships, you get a handoff you can follow, and{" "}
        <Link href="/care-plan" className={inlineLink}>
          the care plan
        </Link>{" "}
        keeps it running if you want it.
      </>
    ),
  },
];


export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="flex min-h-screen flex-col justify-center px-6 pt-20 pb-12 md:pt-24">
        <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="mb-4 font-mono text-sm text-[var(--accent)]">
              Software engineer and consultant &middot; Central Valley and remote
            </p>
            <h1 className="font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
              Your business runs on spreadsheets and duct tape. I can fix that.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)] md:mt-6 md:text-xl">
              I&apos;ve spent 20+ years replacing paper job tickets, rescuing
              legacy platforms, and keeping production servers alive. You get
              one senior engineer who designs it, builds it, and still picks up
              the phone when something goes sideways.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 md:mt-10">
              <BookingLink source="home" testId="home-hero-cta" />
              {/* The entry offer above the fold (#100); the work stays one click away under Selected work. */}
              <TrackedLink href="/automation-sprint" placement="home-hero" className={secondaryButton}>
                Automation sprint &middot; {formatSprintPrice()}
              </TrackedLink>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
            <Image
              src="/images/jason-shultz.jpg"
              alt="Jason Shultz"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 384px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section aria-label="Track record" className="border-y border-[var(--border)] bg-[var(--bg)] px-6 py-12">
        <dl className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 md:grid-cols-4">
          {proofPoints.map((point) => (
            <div key={point.value}>
              <dt className="font-mono text-2xl text-[var(--accent)]">{point.value}</dt>
              <dd className="mt-2 text-sm text-[var(--text-secondary)]">{point.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Services: the nav's Services link lands here (html's scroll-padding clears the fixed header). */}
      <section id="services" aria-labelledby="services-heading" className="px-6 py-24 md:py-32">
        <FocusOnHash hash="services" target="services-heading" />
        <div className="mx-auto max-w-[1280px]">
          {/* A focus target, not a control: FocusOnHash moves focus here so the next Tab
              continues from this section. Chrome draws its ring even after a mouse click,
              so the outline is always off; after keyboard activation (NavAnchor sets
              data-nav-input on <html>) a thin accent underline shows where focus landed. */}
          <h2
            id="services-heading"
            tabIndex={-1}
            className={`${eyebrow} focus:outline-none in-data-[nav-input=keyboard]:focus:underline in-data-[nav-input=keyboard]:focus:decoration-2 in-data-[nav-input=keyboard]:focus:underline-offset-4`}
          >
            Services
          </h2>
          <ul data-testid="service-choices" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            {serviceChoices.map((choice) => (
              <li key={choice.href} className={choice.span}>
                <TrackedLink
                  href={choice.href}
                  placement="home-services"
                  ariaLabel={`${choice.name}, ${choice.price}`}
                  className="group flex h-full flex-col rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)] focus-visible:border-[var(--accent)]"
                >
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                    {choice.name}
                  </h3>
                  <p className="mt-2 font-mono text-lg text-[var(--accent)] tabular-nums">{choice.price}</p>
                  <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">{choice.body}</p>
                  <span className="mt-auto pt-4 font-mono text-sm text-[var(--accent)] group-hover:text-[var(--accent-hover)]">
                    {choice.cta} →
                  </span>
                </TrackedLink>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col">
            {services.map((service) => (
              <div
                key={service.title}
                className="grid gap-4 border-t border-[var(--border)] py-10 md:grid-cols-[2fr_3fr]"
              >
                <h3 className={sectionHeading}>{service.title}</h3>
                <div>
                  <p className="max-w-[720px] text-lg leading-relaxed text-[var(--text-secondary)]">
                    {service.body}
                  </p>
                  {service.link && (
                    <Link href={service.link.href} className={`mt-4 ${accentLink}`}>
                      {service.link.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected work */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>Selected work</p>
          <h2 className={`mb-4 ${sectionHeading}`}>Systems businesses run on</h2>
          <p className="mb-16 max-w-xl text-lg text-[var(--text-secondary)]">
            Client names stay private; the problems and the work are real.
          </p>

          {/* Staggered layout per docs/DESIGN.md anti-slop rules */}
          <div className="flex flex-col gap-8">
            {featuredStudies.map((study, i) => (
              <div
                key={study.slug}
                className={i % 2 === 0 ? "md:w-2/3" : "md:ml-auto md:w-2/3"}
              >
                <AtlasCard {...study} subtitle={study.outcome} />
              </div>
            ))}
          </div>

          <Link href="/work" className={`mt-12 ${accentLink}`}>
            See all case studies →
          </Link>
        </div>
      </section>

      {/* Why me */}
      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>Why me</p>
          <h2 className={`max-w-4xl ${sectionHeading}`}>
            The person who designs your system is the person who gets the call
            when it breaks.
          </h2>
          <p className="mt-8 max-w-[720px] text-lg leading-relaxed text-[var(--text-secondary)]">
            On a lot of software projects, the people who design the system
            never see what happens after launch. I&apos;ve spent years on both
            sides of that handoff, running infrastructure for a fleet of
            production sites while still writing the code. So I build things
            the way someone who&apos;ll be paged at 2am builds them: boring
            where it should be, documented, and easy for the next engineer to
            read.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <h2 className={eyebrow}>How it works</h2>
          <ol className="mt-10 flex max-w-[720px] flex-col gap-10">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-6">
                <span aria-hidden="true" className="font-mono text-sm text-[var(--accent)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-lg leading-relaxed text-[var(--text-secondary)]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p data-testid="offer-ladder" className="mt-12 text-lg text-[var(--text-primary)]">
            {offerLadderParts().map((part, i) =>
              part.href ? (
                <Link key={i} href={part.href} className={inlineLink}>
                  {part.text}
                </Link>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <ClosingCta source="home" />
        </div>
      </section>
    </div>
  );
}
