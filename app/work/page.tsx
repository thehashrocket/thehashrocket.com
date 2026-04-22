import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "@/components/ui/Tag";
import { getCaseStudySummaries } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies from 14 years building complex, high-stakes software — pharma logistics, EdTech, nonprofit platforms, and manufacturing systems.",
  openGraph: {
    url: "https://thehashrocket.com/work",
  },
};

const caseStudies = getCaseStudySummaries();

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
          Over 14 years I&apos;ve built systems across pharma logistics, EdTech,
          nonprofit technology, and manufacturing. These case studies represent
          the kind of complex, high-stakes problems I solve.
        </p>

        {/* Full-width previews, alternating sides per docs/DESIGN.md */}
        <div className="flex flex-col gap-16">
          {caseStudies.map((study, i) => (
            <Link
              key={study.slug}
              href={`/work/${study.slug}`}
              className="group block rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] transition-colors hover:border-[var(--accent)]"
            >
              <div
                className={`flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-sm)] md:w-1/2"
                  style={{
                    backgroundColor: `${study.accent}10`,
                    border: `1px solid ${study.accent}30`,
                  }}
                >
                  {[`nonprofit-matching`, `grant-discovery`, `print-portal`].includes(study.slug) && (
                    <Image
                      src={`/images/work/${study.slug}.png`}
                      alt={study.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>

                <div className="md:w-1/2">
                  <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                    {study.title}
                  </h2>
                  <p className="mt-3 text-lg leading-relaxed text-[var(--text-secondary)]">
                    {study.subtitle}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {study.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
