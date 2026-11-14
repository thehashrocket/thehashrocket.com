import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AtlasCard } from "@/components/ui/AtlasCard";
import { BookingLink, secondaryButton } from "@/components/ui/BookingLink";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { getCaseStudySummaries } from "@/lib/case-studies";
import { formatReviewPrice } from "@/lib/offers";

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

const accentLink =
  "inline-flex min-h-[44px] items-center font-mono text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]";

const services: { title: string; body: string; link?: { href: string; label: string } }[] = [
  {
    title: "Build it.",
    body: "Custom software that replaces the paper, the spreadsheets, and the six disconnected tools. Quotes, job tracking, inventory, production queues, invoicing, integrations with QuickBooks and whatever else you already pay for.",
  },
  {
    title: "Rescue it.",
    body: "You inherited a system and the person who built it is long gone. Maybe it's a legacy app, a pile of WordPress sites, or an automation that worked great until it didn't. Or someone on your team built it with AI, it's running the business now, and nobody knows what's risky in it. I figure out what it actually does, tell you plainly what it'll take, and fix it.",
    link: { href: "/ai-app-review", label: "Get an AI-built app reviewed →" },
  },
  {
    title: "Keep it running.",
    body: "Servers, security, updates, backups, and the 6am call before the morning shift. Ongoing support on a monthly retainer, so you have an engineer before you need one.",
  },
];

const steps: { title: string; body: ReactNode }[] = [
  {
    title: "A 20-minute call.",
    body: "You tell me what's broken or what you need. I tell you honestly whether I'm the right fit.",
  },
  {
    title: "A paid discovery or a fixed-fee review.",
    body: (
      <>
        For anything bigger than a quick fix, I map what exists, find the real problems, and give you a written plan
        with estimates. If you already have an app someone built with AI, a{" "}
        <Link href="/ai-app-review" className="text-[var(--accent)] underline-offset-4 hover:underline">
          fixed-fee review
        </Link>{" "}
        tells you what&apos;s risky and what to fix first, and it takes the place of discovery for that app. You own
        either report whether or not we keep working together.
      </>
    ),
  },
  {
    title: "Build or support.",
    body: "A fixed-scope project, or an ongoing retainer for systems that need a steady hand.",
  },
];

const eyebrow = "mb-2 font-mono text-sm text-[var(--accent)]";
const sectionHeading =
  "font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="flex min-h-screen flex-col justify-center px-6 pt-24 pb-12">
        <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="mb-4 font-mono text-sm text-[var(--accent)]">
              Software engineer and consultant &middot; Central Valley and remote
            </p>
            <h1 className="font-display text-[clamp(40px,5.5vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
              Your business runs on spreadsheets and duct tape. I can fix that.
            </h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-[var(--text-secondary)]">
              I&apos;ve spent 20+ years replacing paper job tickets, rescuing
              legacy platforms, and keeping production servers alive. You get
              one senior engineer who designs it, builds it, and still picks up
              the phone when something goes sideways.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <BookingLink source="home" />
              <Link href="/work" className={secondaryButton}>
                See the work
              </Link>
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

      {/* What I do */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <p className={eyebrow}>What I do</p>
          <div className="mt-10 flex flex-col">
            {services.map((service) => (
              <div
                key={service.title}
                className="grid gap-4 border-t border-[var(--border)] py-10 md:grid-cols-[2fr_3fr]"
              >
                <h2 className={sectionHeading}>{service.title}</h2>
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
          <p className="mt-12 text-lg text-[var(--text-primary)]">
            Projects typically start at $10,000. An AI-built app review is a flat{" "}
            {formatReviewPrice()}. Retainers are scoped to what you run.
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
