import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArchitectureDiagram } from "@/components/ui/ArchitectureDiagram";
import { CaseStudyScroll } from "@/components/ui/CaseStudyScroll";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { SceneSync } from "@/components/ui/SceneSync";
import { caseStudies, caseStudySlugs } from "@/lib/case-studies";
import { getAllLocations } from "@/lib/locations";

const studies = caseStudies;

type PageParams = { slug: string };

export const dynamicParams = false;

export async function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = studies[slug];
  if (!study) notFound();
  return {
    title: study.title,
    description: study.subtitle,
    openGraph: {
      url: `https://www.jasonshultz.com/work/${slug}`,
    },
  };
}

function BreadcrumbListJsonLd({ slug, title }: { slug: string; title: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.jasonshultz.com" },
      { "@type": "ListItem", position: 2, name: "Work", item: "https://www.jasonshultz.com/work" },
      { "@type": "ListItem", position: 3, name: title, item: `https://www.jasonshultz.com/work/${slug}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const study = studies[slug];

  if (!study) notFound();

  return (
    <div className="px-6 pt-32 pb-24">
      <SceneSync slug={slug} />
      <BreadcrumbListJsonLd slug={slug} title={study.title} />
      <div className="mx-auto max-w-[720px]">
        <Link
          href="/work"
          className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          &larr; Back to work
        </Link>

        {/* Solid background: the scene is at full brightness up here */}
        <div className="-mx-3 w-fit rounded-[var(--radius-sm)] bg-[var(--bg)] px-3 py-2">
          <h1
            className="font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl"
            style={{ color: study.accent }}
          >
            {study.title}
          </h1>
          <p className="mt-4 text-xl text-[var(--text-secondary)]">
            {study.subtitle}
          </p>

          {/* Result bar */}
          <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 font-mono text-sm text-[var(--text-primary)]">
            {study.results.map((result, i) => (
              <li key={result} className="flex gap-4">
                {i > 0 && <span aria-hidden="true" className="text-[var(--text-muted)]">&middot;</span>}
                {result}
              </li>
            ))}
          </ul>
        </div>

        {/* Fact panel */}
        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div>
            <dt className="font-mono text-xs text-[var(--text-muted)]">Industry</dt>
            <dd className="mt-1 text-sm text-[var(--text-primary)]">{study.industry}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs text-[var(--text-muted)]">Status</dt>
            <dd className="mt-1 text-sm text-[var(--text-primary)]">{study.status}</dd>
          </div>
        </dl>

        <ArchitectureDiagram
          title={study.title}
          steps={study.diagram}
          accent={study.accent}
          className="mt-8 rounded-[var(--radius-md)]"
        />
      </div>

      {/* Scroll-driven narrative */}
      <CaseStudyScroll beats={study.beats} />

      <div className="mx-auto mt-16 max-w-[720px]">
        {/* Solid background: this line sits directly on the 3D scene */}
        <p className="-ml-3 inline-block rounded-[var(--radius-sm)] bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--text-muted)]">
          Built with {study.tags.join(", ")}
        </p>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-16 max-w-[720px] border-t border-[var(--border)] pt-16">
        <ClosingCta
          heading={study.cta.heading}
          body={study.cta.body}
          source={`work-${slug}`}
        />

        {study.relatedLanding && (
          <Link
            href={study.relatedLanding.href}
            className="mt-8 inline-flex min-h-[44px] items-center font-mono text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            {study.relatedLanding.label}
          </Link>
        )}

        <p className="mt-8 text-sm text-[var(--text-secondary)]">
          Serving the Central Valley:{" "}
          {getAllLocations().map((location, i) => (
            <span key={location.slug}>
              {i > 0 && " · "}
              <Link
                href={`/locations/${location.slug}`}
                className="transition-colors hover:text-[var(--text-primary)]"
              >
                {location.name}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
