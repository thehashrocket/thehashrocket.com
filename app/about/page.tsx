import type { Metadata } from "next";
import { Timeline } from "@/components/ui/Timeline";
import { careerEntries, skills, domains } from "@/lib/experience";

export const metadata: Metadata = {
  title: "About",
  description:
    "14 years of full-stack engineering. From startups to enterprises, I build systems that work.",
  openGraph: {
    url: "https://thehashrocket.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">About</p>
        <h1 className="mb-8 font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl">
          Jason Shultz
        </h1>

        <div className="space-y-6 text-lg leading-relaxed text-[var(--text-secondary)]">
          <p>
            I&apos;m a senior full-stack engineer with over 14 years of
            experience building complex software systems. I&apos;ve worked
            across EdTech, pharmaceutical logistics, nonprofit technology, and
            manufacturing — the kind of domains where software failures have
            real consequences.
          </p>
          <p>
            My career spans the full stack: from database architecture and API
            design to interactive frontends and 3D visualization. I&apos;ve
            built warehouse management systems handling $200M+ in distribution,
            donor matching platforms, AI-powered grant discovery tools, and ERP
            systems for companies undergoing digital transformation.
          </p>
          <p>
            When I consult, I bring the perspective of someone who has seen
            systems succeed and fail at scale. I help teams make architectural
            decisions that they won&apos;t regret in two years.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-[var(--text-primary)]">
              Core Stack
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[var(--text-secondary)]">
              {[...skills.languages, ...skills.frameworks].map((skill) => (
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
            href="https://www.linkedin.com/in/jasonshultz/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            LinkedIn →
          </a>
          <a
            href="https://github.com/thehashrocket"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
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
      </div>
    </div>
  );
}
