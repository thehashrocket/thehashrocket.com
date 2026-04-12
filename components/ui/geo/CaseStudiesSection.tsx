import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import { getCaseStudySummaries } from "@/lib/case-studies";
import type { Location } from "@/lib/locations";

export function CaseStudiesSection({ location }: { location: Location }) {
  const studies = getCaseStudySummaries();
  const connectorMap = new Map(
    location.caseStudyConnectors.map((c) => [c.slug, c.connector]),
  );

  return (
    <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">
          Proven Results
        </p>
        <h2 className="mb-12 font-display text-[32px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Work That Matters Here
        </h2>

        <div className="flex flex-col gap-6">
          {studies.map((study) => (
            <Link
              key={study.slug}
              href={`/work/${study.slug}`}
              className="group rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                    {study.title}
                  </h3>
                  <p className="mt-1 text-[var(--text-secondary)]">
                    {study.subtitle}
                  </p>
                  {connectorMap.get(study.slug) && (
                    <p className="mt-2 text-sm italic text-[var(--text-muted)]">
                      {connectorMap.get(study.slug)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {study.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
