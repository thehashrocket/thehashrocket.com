import type { Metadata } from "next";
import Link from "next/link";
import { ArchitectureDiagram } from "@/components/ui/ArchitectureDiagram";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { Tag } from "@/components/ui/Tag";
import { getCaseStudyGroups } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies from 20+ years building complex, high-stakes software — web applications, legacy modernization, infrastructure, pharma logistics, nonprofit platforms, and print production systems.",
  openGraph: {
    url: "https://thehashrocket.com/work",
  },
};

const groups = getCaseStudyGroups();
const orderedSlugs = groups.flatMap((g) => g.studies.map((s) => s.slug));

export default function WorkPage() {
  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-[1280px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">
          Case Studies
        </p>
        <h1 className="mb-6 font-display text-6xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-[64px]">
          Work
        </h1>
        <p className="mb-16 max-w-2xl text-xl text-[var(--text-secondary)]">
          Over 20 years I&apos;ve built systems across pharma logistics, EdTech,
          nonprofit technology, e-commerce, and print production, and kept the
          infrastructure under them running. Client names stay private; the
          problems and the work are real.
        </p>

        {/* Full-width previews, alternating sides per docs/DESIGN.md */}
        <div className="flex flex-col gap-24">
          {groups.map(({ group, label, studies }) => (
            <section key={group} aria-label={label}>
              <h2 className="mb-8 font-mono text-sm text-[var(--accent)]">{label}</h2>
              <div className="flex flex-col gap-16">
                {studies.map((study) => {
                  const i = orderedSlugs.indexOf(study.slug);
                  return (
                    <Link
                      key={study.slug}
                      href={`/work/${study.slug}`}
                      className="group block rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--accent)]"
                    >
                      <div
                        className={`flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                      >
                        <ArchitectureDiagram
                          title={study.title}
                          steps={study.diagram}
                          accent={study.accent}
                          className="w-full rounded-[var(--radius-sm)] md:w-1/2 lg:aspect-video"
                        />

                        <div className="md:w-1/2">
                          <h3 className="font-display text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                            {study.title}
                          </h3>
                          <p className="mt-3 text-lg leading-relaxed text-[var(--text-secondary)]">
                            {study.outcome}
                          </p>
                          <div className="mt-6 flex flex-wrap gap-2">
                            {study.status === "In progress" && <Tag>In progress</Tag>}
                            {study.tags.map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-24 border-t border-[var(--border)] pt-16">
          <ClosingCta source="work" />
        </div>
      </div>
    </div>
  );
}
