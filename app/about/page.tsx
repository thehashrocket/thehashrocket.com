import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "25 years of full-stack engineering. From startups to enterprises, I build systems that work.",
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
            I&apos;m a senior full-stack engineer with 25 years of experience
            building complex software systems. I specialize in the kind of
            problems that don&apos;t have obvious solutions — warehouse
            logistics, real-time data pipelines, compliance-heavy applications,
            and AI-augmented workflows.
          </p>
          <p>
            I&apos;ve worked across the entire stack: from database architecture
            and API design to interactive frontends and 3D visualization. My
            approach is pragmatic — I choose the right tool for the job, not the
            trendiest framework.
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
              <li>TypeScript / JavaScript</li>
              <li>React / Next.js</li>
              <li>Ruby on Rails</li>
              <li>Python / FastAPI</li>
              <li>PostgreSQL / Redis</li>
              <li>GraphQL / REST</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-[var(--text-primary)]">
              Domains
            </h2>
            <ul className="space-y-2 font-mono text-sm text-[var(--text-secondary)]">
              <li>Warehouse & Logistics</li>
              <li>Healthcare / Pharma</li>
              <li>Nonprofit / Civic Tech</li>
              <li>AI / ML Pipelines</li>
              <li>Real-time Systems</li>
              <li>Compliance & Audit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
