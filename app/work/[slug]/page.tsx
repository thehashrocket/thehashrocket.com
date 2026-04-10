import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Tag } from "@/components/ui/Tag";
import { CaseStudyScroll } from "@/components/ui/CaseStudyScroll";
import Link from "next/link";

interface CaseStudy {
  title: string;
  subtitle: string;
  accent: string;
  tags: string[];
  beats: { heading: string; body: string }[];
}

const studies: Record<string, CaseStudy> = {
  "pharma-wms": {
    title: "Pharma WMS",
    subtitle:
      "Warehouse management system for pharmaceutical distribution",
    accent: "#4ade80",
    tags: ["Ruby on Rails", "React", "PostgreSQL", "Redis"],
    beats: [
      {
        heading: "The Problem",
        body: "A pharmaceutical distributor was managing warehouse operations across multiple facilities with spreadsheets and legacy tools. Compliance errors were common, inventory was unreliable, and scaling to new facilities meant duplicating manual processes.",
      },
      {
        heading: "The Approach",
        body: "I designed a real-time warehouse management system with barcode-driven workflows, automated compliance checks, and multi-facility inventory synchronization. Every movement is audited. Every temperature excursion is flagged instantly.",
      },
      {
        heading: "The Architecture",
        body: "Rails API with React frontend. PostgreSQL for transactional data with Redis pub/sub for real-time updates. Background jobs handle compliance reporting, inventory reconciliation, and facility sync. The system processes thousands of transactions per hour with sub-second response times.",
      },
      {
        heading: "The Results",
        body: "98% reduction in compliance incidents. 3x faster order fulfillment. Successfully scaled from 1 to 4 facilities without architecture changes. The system now handles $200M+ in annual pharmaceutical distribution.",
      },
    ],
  },
  "nonprofit-matching": {
    title: "Nonprofit Matching",
    subtitle:
      "Connecting donors with organizations through intelligent matching",
    accent: "#3b82f6",
    tags: ["Next.js", "GraphQL", "Neo4j", "TypeScript"],
    beats: [
      {
        heading: "The Problem",
        body: "Donors struggled to find nonprofits aligned with their values. Existing platforms offered basic search but no intelligent matching. Millions in potential donations were lost to decision fatigue.",
      },
      {
        heading: "The Approach",
        body: "Graph-based matching using donor preferences, organization missions, and community connections. The system learns from giving patterns and surfaces unexpected but relevant matches.",
      },
      {
        heading: "The Architecture",
        body: "Next.js frontend with GraphQL API backed by Neo4j for relationship queries. The graph model captures organizations, causes, donors, and their interconnections. Real-time recommendation engine updates as donors interact.",
      },
      {
        heading: "The Results",
        body: "4x increase in donor engagement. Average donation size increased 60% through better matching. Platform facilitated $2M+ in donations in the first year.",
      },
    ],
  },
  "grant-discovery": {
    title: "Grant Discovery",
    subtitle: "AI-powered grant matching and application tracking",
    accent: "#f59e0b",
    tags: ["Python", "LLM", "PostgreSQL", "FastAPI"],
    beats: [
      {
        heading: "The Problem",
        body: "Researchers spent weeks manually searching for relevant grants across dozens of databases. Most opportunities were missed because of timing, eligibility mismatches, or simply not knowing they existed.",
      },
      {
        heading: "The Approach",
        body: "An AI pipeline that ingests grant databases, extracts eligibility criteria using NLP, and matches against researcher profiles. Automated alerts for new opportunities. Application timeline tracking.",
      },
      {
        heading: "The Architecture",
        body: "Python/FastAPI backend with LLM-powered parsing. PostgreSQL with pgvector for semantic search. ETL pipeline processes grant feeds nightly. The matching engine scores opportunities against researcher expertise and institution eligibility.",
      },
      {
        heading: "The Results",
        body: "Researchers discovered 3x more relevant grants. Time spent searching reduced by 80%. The platform now indexes 50,000+ active grant opportunities.",
      },
    ],
  },
};

type PageParams = { slug: string };

export async function generateStaticParams() {
  return Object.keys(studies).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = studies[slug];
  if (!study) return {};
  return {
    title: study.title,
    description: study.subtitle,
  };
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
      </div>
    </div>
  );
}
