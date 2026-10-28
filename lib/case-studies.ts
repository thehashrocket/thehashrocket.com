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
  "storefront-consolidation": {
    slug: "storefront-consolidation",
    title: "Storefront Consolidation",
    subtitle:
      "Nine legacy e-commerce storefronts rebuilt as one multi-tenant platform",
    accent: "#fb923c",
    tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Multi-tenant"],
    beats: [
      {
        heading: "The Problem",
        body: "A print company ran nine separate Magento storefronts, one per customer program, spread across several servers. Each store was its own codebase, its own patch schedule, and its own attack surface. Keeping nine stores patched and secure in place had stopped being realistic.",
      },
      {
        heading: "The Approach",
        body: "I made the case for rebuild-and-migrate over remediate-in-place and got it approved. Then I wrote a functional spec for a single multi-tenant platform and ran a gap analysis against the product team's MVP document over two rounds of review, so everyone agreed on what \"done\" meant before code shipped.",
      },
      {
        heading: "The Architecture",
        body: "One Next.js and TypeScript application with Prisma over PostgreSQL. Each storefront becomes a tenant with its own catalog, branding, and customers, sharing one codebase and one deployment pipeline. Orders flow straight into the print shop's production system instead of being re-keyed by hand.",
      },
      {
        heading: "The Results",
        body: "Nine codebases become one. Security patches ship once instead of nine times. A new customer program launches as a tenant configuration instead of a new server, and orders land in production without anyone retyping them.",
      },
    ],
  },
  "wordpress-modernization": {
    slug: "wordpress-modernization",
    title: "WordPress Modernization",
    subtitle:
      "Moving aging nonprofit and e-commerce sites onto a modern, maintainable stack",
    accent: "#a78bfa",
    tags: ["WordPress", "PHP 8", "WooCommerce", "Git", "Managed Hosting"],
    beats: [
      {
        heading: "The Problem",
        body: "A group of client sites, including nonprofits and a WooCommerce multisite, had been built years earlier on a custom server-provisioning toolchain that had fallen out of maintenance. Some were still on PHP 7.4 with a dozen outdated plugins apiece. Every PHP deprecation notice was a countdown.",
      },
      {
        heading: "The Approach",
        body: "Rebuilding from scratch would have burned the budget on things that already worked. I kept each site's design and modernized everything underneath it: stripped out the legacy provisioning layer, upgraded themes for PHP 8.4, worked through the plugin backlog, and replaced plugins that existed for one small job with a few lines of custom code.",
      },
      {
        heading: "The Architecture",
        body: "Each theme lives in its own Git repository with a modern build toolchain and deploys to managed WordPress hosting with separate staging and production environments. Staging syncs from production, so changes get tested against real content before they go live. Stray legacy files in the web root get cleaned out or moved into the media library where they belong.",
      },
      {
        heading: "The Results",
        body: "Sites that were one deprecation away from going dark now run on supported PHP, with backups, staging, and a deploy history. The process is a repeatable playbook, so each new site needs less discovery than the last.",
      },
    ],
  },
  "fleet-security-audit": {
    slug: "fleet-security-audit",
    title: "Fleet Security Audit",
    subtitle:
      "Auditing 125 production sites across eight servers, then fixing what mattered first",
    accent: "#f87171",
    tags: ["AWS EC2", "nginx", "Apache", "Bash", "WordPress", "Security"],
    beats: [
      {
        heading: "The Problem",
        body: "Years of steady growth had left 125 client sites spread across eight EC2 servers and a managed hosting account, each set up a little differently. Without one consistent view of what was running where and what was out of date, there was no way to rank the risk.",
      },
      {
        heading: "The Approach",
        body: "I built a multi-script audit pipeline with variants for Apache servers, nginx servers, and managed hosting, so every site got checked the same way no matter where it lived. When the audit surfaced an issue that couldn't wait for the final report, I handled containment first and kept the audit moving.",
      },
      {
        heading: "The Architecture",
        body: "The scripts collect configuration, software versions, and application-level details from every host and normalize them into a single dataset. That dataset feeds a remediation workbook that ranks each finding by severity and groups the fixes into workstreams with effort estimates.",
      },
      {
        heading: "The Results",
        body: "Leadership got a prioritized remediation plan with real estimates in place of a vague sense of dread. The audit scripts are reusable, so the next audit is a rerun instead of a project.",
      },
    ],
  },
  "automation-rescue": {
    slug: "automation-rescue",
    title: "Automation Rescue",
    subtitle:
      "Assessing and repairing a recruiting pipeline built on n8n, Airtable, and Microsoft 365",
    accent: "#f472b6",
    tags: ["n8n", "Airtable", "Microsoft Graph", "Automation", "Assessment"],
    beats: [
      {
        heading: "The Problem",
        body: "A recruiting firm ran its candidate pipeline on n8n workflows connecting Airtable to Microsoft 365 through the Graph API. The workflows had grown piece by piece, and when they started misbehaving, the first job was figuring out what the system actually did from end to end.",
      },
      {
        heading: "The Approach",
        body: "I didn't touch anything until I'd done a technical assessment: every workflow, trigger, and integration point mapped, and every failure traced back to its source. The assessment showed the real job was bigger than the original estimate, so I said so early, with evidence, instead of letting it surface on an invoice.",
      },
      {
        heading: "The Architecture",
        body: "n8n orchestrates the pipeline, Airtable holds the candidate and pipeline data, and Microsoft Graph handles the Microsoft 365 side. Remediation aimed for a chain the client could trust and the next engineer could read, with each workflow owning one clear job.",
      },
      {
        heading: "The Results",
        body: "Two discovery reports: one for engineers with the technical findings, and one for the client explaining in plain language why the work needed two more weeks. The client approved the expanded scope knowing exactly what they were paying for and why.",
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
