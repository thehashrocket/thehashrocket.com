export interface CaseStudyBeat {
  heading: string;
  body: string;
}

export interface CaseStudySummary {
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  tags: string[];
}

export interface CaseStudy extends CaseStudySummary {
  beats: CaseStudyBeat[];
}

export const caseStudies: Record<string, CaseStudy> = {
  "pharma-wms": {
    slug: "pharma-wms",
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
    slug: "nonprofit-matching",
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
    slug: "grant-discovery",
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
  "print-portal": {
    slug: "print-portal",
    title: "Print Portal",
    subtitle: "Production management portal for a print shop operator",
    accent: "#06b6d4",
    tags: ["Next.js", "TypeScript", "tRPC", "PostgreSQL", "QuickBooks"],
    beats: [
      {
        heading: "The Problem",
        body: "A print shop operator was managing the entire production lifecycle on paper and spreadsheets — customer quotes, job tickets, typesetting proofs, press runs, and invoicing. Each job touched four departments (Prepress, Press, Bindery, Shipping) with no shared visibility. Status checks required walking the floor. QuickBooks was updated by hand.",
      },
      {
        heading: "The Approach",
        body: "I built a portal where every job follows a defined path: quote to work order, work order to order, order to invoice. Typesetting proofs route through multi-iteration client approvals online. Each department sees its own live queue. Shipping dispatches via FedEx, UPS, USPS, or courier. QuickBooks syncs customers, invoices, and payments bidirectionally.",
      },
      {
        heading: "The Architecture",
        body: "T3 stack: Next.js App Router with tRPC (32 routers) and Prisma over PostgreSQL (38 models). NextAuth with Google OAuth and magic links. AG Grid for order management. Pusher for real-time production status. jsPDF for invoice generation. QuickBooks Online OAuth integration. Role-based access across 9 staff roles with 45 granular permissions.",
      },
      {
        heading: "The Results",
        body: "Eliminated paper job tickets entirely. Every department has live production status without walking the floor. Clients approve proofs online instead of by fax or email. Finance syncs directly to QuickBooks without re-keying data.",
      },
    ],
  },
};

export const caseStudySlugs = Object.keys(caseStudies);

export function getCaseStudySummaries(): CaseStudySummary[] {
  return Object.values(caseStudies).map(({ slug, title, subtitle, accent, tags }) => ({
    slug,
    title,
    subtitle,
    accent,
    tags,
  }));
}
