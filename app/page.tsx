import Link from "next/link";
import { AtlasCard } from "@/components/ui/AtlasCard";
import { Tag } from "@/components/ui/Tag";
import { getCaseStudySummaries } from "@/lib/case-studies";
import { skills, domains } from "@/lib/experience";

const caseStudies = getCaseStudySummaries();

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="flex min-h-screen flex-col items-start justify-center px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="mb-4 font-mono text-sm text-[var(--accent)]">
            Senior Full-Stack Engineer
          </p>
          <h1 className="max-w-4xl font-display text-[clamp(48px,8vw,96px)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)]">
            I build systems
            <br />
            that work.
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-[var(--text-secondary)]">
            14 years of engineering complex, high-stakes software.
            From warehouse logistics to AI pipelines — if it needs to be
            reliable, I&apos;ve built it.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-6 py-2.5 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Start a conversation
            </Link>
            <Link
              href="/work"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
            >
              View work
            </Link>
          </div>
        </div>
      </section>

      {/* Systems Atlas */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-2 font-mono text-sm text-[var(--accent)]">
            Selected Work
          </p>
          <h2 className="mb-16 font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl">
            Systems Atlas
          </h2>

          {/* Staggered layout per docs/DESIGN.md anti-slop rules */}
          <div className="flex flex-col gap-8">
            {caseStudies.map((study, i) => (
              <div
                key={study.slug}
                className={`${
                  i === 0
                    ? "md:w-3/4"
                    : i === 1
                      ? "md:ml-auto md:w-2/3"
                      : i % 2 === 0
                        ? "md:w-1/2"
                        : "md:ml-auto md:w-1/2"
                }`}
              >
                <AtlasCard {...study} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack & Domains */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-4 font-mono text-sm text-[var(--accent)]">
            Stack &amp; Domains
          </p>
          <div className="flex flex-wrap gap-2">
            {[...skills.frameworks, ...skills.databases].map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            {domains.join(", ")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="mb-6 font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl">
            Have a complex problem?
          </h2>
          <p className="mb-10 max-w-xl text-lg text-[var(--text-secondary)]">
            I help teams architect and build systems that need to actually work
            at scale. Let&apos;s talk about what you&apos;re building.
          </p>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-8 py-3 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
