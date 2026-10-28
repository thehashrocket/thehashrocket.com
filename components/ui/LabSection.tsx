import { Tag } from "@/components/ui/Tag";
import { sideProjects } from "@/lib/side-projects";

// Staggered, varying-width cards per docs/DESIGN.md "Lab" rule —
// no uniform grid. Widths alternate 7/5 then 5/7 across a 12-col grid.
const SPANS = ["md:col-span-7", "md:col-span-5 md:mt-16", "md:col-span-5", "md:col-span-7 md:mt-12"];

export function LabSection() {
  return (
    <section className="px-6 py-24 md:py-32" aria-labelledby="lab-heading">
      <div className="mx-auto max-w-[1280px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">Lab</p>
        <h2
          id="lab-heading"
          className="mb-4 font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl"
        >
          Things I build for fun
        </h2>
        <p className="mb-16 max-w-xl text-lg text-[var(--text-secondary)]">
          Side projects, tools I use every day, and
          whatever I&apos;m curious about this month.
        </p>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          {sideProjects.map((project, i) => (
            <article
              key={project.slug}
              className={`relative rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors md:p-8 ${project.url ? "hover:border-[var(--accent)]" : ""} ${SPANS[i % SPANS.length]}`}
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-[var(--accent)] after:absolute after:inset-0 after:content-['']"
                    >
                      {project.name}
                      <span aria-hidden="true" className="ml-2 font-mono text-base text-[var(--text-muted)]">↗</span>
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <span className="font-mono text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  {project.status}
                </span>
              </div>
              <p className="mb-5 leading-relaxed text-[var(--text-secondary)]">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
