import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Tag } from "@/components/ui/Tag";
import { CaseStudyScroll } from "@/components/ui/CaseStudyScroll";
import Link from "next/link";
import { caseStudies, caseStudySlugs } from "@/lib/case-studies";

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
      url: `https://thehashrocket.com/work/${slug}`,
    },
  };
}

function BreadcrumbListJsonLd({ slug, title }: { slug: string; title: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thehashrocket.com" },
      { "@type": "ListItem", position: 2, name: "Work", item: "https://thehashrocket.com/work" },
      { "@type": "ListItem", position: 3, name: title, item: `https://thehashrocket.com/work/${slug}` },
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
      <BreadcrumbListJsonLd slug={slug} title={study.title} />
      <div className="mx-auto max-w-[720px]">
        <Link
          href="/work"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          &larr; Back to work
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {study.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <h1
          className="font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl"
          style={{ color: study.accent }}
        >
          {study.title}
        </h1>
        <p className="mt-4 text-xl text-[var(--text-secondary)]">
          {study.subtitle}
        </p>
      </div>

      {/* Scroll-driven narrative */}
      <CaseStudyScroll beats={study.beats} slug={slug} />

      {/* CTA */}
      <div className="mx-auto mt-24 max-w-[720px] border-t border-[var(--border)] pt-16">
        <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          Interested in working together?
        </h2>
        <p className="mt-3 text-lg text-[var(--text-secondary)]">
          I help teams build systems like this. Let&apos;s talk about your
          project.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-8 py-3 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          Get in touch
        </Link>

        <p className="mt-8 text-sm text-[var(--text-muted)]">
          Serving the Central Valley:{" "}
          <Link href="/locations/sacramento" className="transition-colors hover:text-[var(--text-primary)]">Sacramento</Link>
          {" · "}
          <Link href="/locations/stockton" className="transition-colors hover:text-[var(--text-primary)]">Stockton</Link>
          {" · "}
          <Link href="/locations/modesto" className="transition-colors hover:text-[var(--text-primary)]">Modesto</Link>
        </p>
      </div>
    </div>
  );
}
