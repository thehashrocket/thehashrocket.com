import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { Timeline } from "@/components/ui/Timeline";
import { careerEntries, coreStack, domains } from "@/lib/experience";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "20+ years building, rescuing, and running the software businesses depend on. The person who designs your system is the person who gets the call when it breaks.",
  openGraph: {
    url: "https://www.jasonshultz.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-[720px]">
        <div className="relative mb-10 aspect-[4/5] w-48 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
          <Image
            src="/images/jason-shultz.jpg"
            alt="Jason Shultz"
            fill
            priority
            sizes="192px"
            className="object-cover"
          />
        </div>
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">About</p>
        <h1 className="mb-8 font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl">
          Jason Shultz
        </h1>

        <div className="space-y-6 text-lg leading-relaxed text-[var(--text-secondary)]">
          <p>
            I&apos;m a senior full-stack engineer with over 20 years of
            experience building web applications and the systems behind them.
            I&apos;ve worked across pharmaceutical logistics, nonprofit
            technology, EdTech, e-commerce, and print production, the kind of
            domains where software failures have real consequences.
          </p>
          <p>
            These days I split my time between leading infrastructure and
            engineering for a fleet of production sites and writing the code
            myself. I&apos;ve built warehouse management systems handling
            $200M+ in distribution and multi-tenant platforms on Next.js and
            Postgres. I&apos;ve also run the security audits, legacy
            migrations, and late-night incident calls that keep everything
            else alive.
          </p>
          <p>
            When you hire me, the person who designs your system is the same
            person who knows what happens when it breaks. I help teams make
            architectural decisions they won&apos;t regret in two years.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-[var(--text-primary)]">
              Core Stack
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[var(--text-secondary)]">
              {coreStack.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-[var(--text-primary)]">
              Domains
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[var(--text-secondary)]">
              {domains.map((domain) => (
                <li key={domain}>{domain}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 flex gap-6">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            LinkedIn →
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            GitHub →
          </a>
        </div>

        {/* Career Timeline */}
        <div className="mt-24">
          <p className="mb-2 font-mono text-sm text-[var(--accent)]">Career</p>
          <h2 className="mb-12 font-display text-[32px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Where I&apos;ve been
          </h2>
          <Timeline entries={careerEntries} />
        </div>

        {/* Lab teaser */}
        <div className="mt-16">
          <p className="mb-2 font-mono text-sm text-[var(--accent)]">Outside work</p>
          <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
            I still build things nobody asked for: side projects, tools I use
            every day, and whatever I&apos;m curious about this month.{" "}
            <Link href="/lab" className="text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
              See the Lab →
            </Link>
          </p>
        </div>

        <div className="mt-24 border-t border-[var(--border)] pt-16">
          <ClosingCta source="about" />
        </div>
      </div>
    </div>
  );
}
