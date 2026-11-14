import { offerLadderText } from "@/lib/offers";

export interface FAQ {
  question: string;
  answer: string;
}

export interface CaseStudyConnector {
  slug: string;
  connector: string;
}

export interface Industry {
  name: string;
  /** How my work applies. An industry I can't say this about gets cut. */
  line: string;
}

export interface Location {
  slug: string;
  name: string;
  /** Cities for structured data, when one page covers several. */
  cities?: string[];
  region: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  industries: Industry[];
  economicContext: string;
  whyLocal: string;
  faqs: FAQ[];
  /** The studies shown on this page, in order. Keep to the three most relevant. */
  caseStudyConnectors: CaseStudyConnector[];
  localExperience?: string;
}

export const locations: Record<string, Location> = {
  sacramento: {
    slug: "sacramento",
    name: "Sacramento",
    region: "Sacramento County, CA",
    metaTitle: "Software Engineer in Sacramento, CA",
    metaDescription:
      "Senior full-stack engineer in Sacramento building custom software for businesses running on paper, spreadsheets, or systems nobody wants to touch.",
    heroHeadline: "I build complex systems\nfor Sacramento businesses",
    heroSubheadline:
      "20+ years engineering high-stakes software, including years in Sacramento building pharmaceutical distribution systems. You work directly with the engineer who builds it.",
    industries: [
      { name: "Distribution & Life Sciences", line: "Audited inventory movements and temperature excursion alerts, built for pharmaceutical distribution." },
      { name: "Nonprofits & Civic Tech", line: "Nonprofit platforms, plus aging WordPress sites brought up to date without starting over." },
      { name: "Owner-Operated Businesses", line: "Custom software to replace the paper, spreadsheets, and disconnected tools you've outgrown." },
    ],
    economicContext:
      "Sacramento is California's capital and a growing tech hub, with large healthcare systems, a deep nonprofit sector, and an emerging AgTech corridor. The businesses around them need software that holds up without an enterprise budget.",
    whyLocal:
      "I'm based in the Central Valley and I work directly with your team, with no account manager in between. When something breaks before the morning shift, I'm not three timezones away.",
    faqs: [
      {
        question: "What types of software do you build for Sacramento businesses?",
        answer:
          "I build custom web applications, internal tools, data pipelines, and AI-powered systems. Work includes warehouse management systems handling $200M+ in distribution, nonprofit matching platforms, and AI grant discovery tools.",
      },
      {
        question: "What is your typical project budget?",
        answer:
          `${offerLadderText()} Ongoing support is a monthly plan, scoped to what you run.`,
      },
      {
        question: "How do you handle ongoing maintenance?",
        answer:
          "I offer monthly support for production systems: monitoring, backups, updates, bug fixes and performance work. New features are quoted separately.",
      },
    ],
    caseStudyConnectors: [
      { slug: "pharma-wms", connector: "Compliance-heavy warehouse software from my years working in Sacramento." },
      { slug: "wordpress-modernization", connector: "How I bring aging nonprofit and e-commerce sites up to date without starting over." },
      { slug: "nonprofit-matching", connector: "Relevant if your organization runs on donors and community relationships." },
    ],
    localExperience: "I spent several years working in Sacramento, building pharmaceutical distribution systems — the kind of compliance-heavy, data-intensive software this region's industries demand.",
  },
  stockton: {
    slug: "stockton",
    name: "Stockton",
    region: "San Joaquin County, CA",
    metaTitle: "Software Engineer in Stockton & San Joaquin County, CA",
    metaDescription:
      "Senior full-stack engineer serving Stockton and San Joaquin County. Custom software for logistics, distribution, and manufacturing operations.",
    heroHeadline: "Senior engineering for\nSan Joaquin County businesses",
    heroSubheadline:
      "20+ years building the systems that power logistics, distribution, and community services. From warehouse management to nonprofit matching — complex problems solved directly, 1:1.",
    industries: [
      { name: "Logistics & Supply Chain", line: "Barcode-driven warehouse workflows and real-time inventory, proven across four pharmaceutical distribution facilities." },
      { name: "Manufacturing & Distribution", line: "Live production queues and job tracking in place of paper tickets and walking the floor." },
      { name: "Agriculture & Food Processing", line: "I haven't built for this industry yet, but the audit trails and inventory discipline carry over from pharma." },
    ],
    economicContext:
      "Stockton sits at the crossroads of California logistics. An inland port drives a large logistics and distribution network, and San Joaquin County's agricultural output adds to it. The region runs on operational software that needs to be reliable, fast, and auditable.",
    whyLocal:
      "I live in the Central Valley and work directly with local businesses. When your warehouse management system needs a fix, the person who built it is a short drive away, not three timezones away.",
    faqs: [
      {
        question: "Do you build software for logistics and warehouse operations?",
        answer:
          "Absolutely. My most impactful project is a pharmaceutical warehouse management system that handles $200M+ in annual distribution across 4 facilities. I build barcode-driven workflows, real-time inventory tracking, and compliance automation.",
      },
      {
        question: "Can you work with existing systems my business already uses?",
        answer:
          "Yes. Most projects involve integrating with existing ERP systems, databases, or third-party APIs. I specialize in making disparate systems work together reliably.",
      },
      {
        question: "What is your typical project budget?",
        answer:
          `${offerLadderText()} Ongoing support is a monthly plan, scoped to what you run.`,
      },
      {
        question: "How quickly can you start on a new project?",
        answer:
          "I reply within one business day. After a 20-minute call, I can tell you honestly when I could start.",
      },
    ],
    caseStudyConnectors: [
      { slug: "pharma-wms", connector: "Barcode workflows and live inventory, the same problems a San Joaquin County distributor has." },
      { slug: "print-portal", connector: "What it looks like when a production floor comes off paper." },
      { slug: "fleet-security-audit", connector: "For when nobody can say what's running on your servers." },
    ],
    localExperience: "I've built warehouse and distribution software for pharmaceutical logistics, and spent over a year in Modesto on WMS, ERP, and CRM systems for local businesses.",
  },
  modesto: {
    slug: "modesto",
    name: "Modesto",
    region: "Stanislaus County, CA",
    metaTitle: "Software Engineer in Modesto & Stanislaus County, CA",
    metaDescription:
      "Senior full-stack engineer serving Modesto and Stanislaus County. Custom software for manufacturing, distribution, and operations teams replacing paper and spreadsheets.",
    heroHeadline: "Complex software systems\nfor Stanislaus County",
    heroSubheadline:
      "20+ years of engineering for industries that can't afford failure. Pharmaceutical distribution and print production, plus over a year building WMS, ERP, and CRM systems in Modesto. Built by a senior engineer, not an agency.",
    industries: [
      { name: "Manufacturing & Operations", line: "WMS, ERP, and CRM systems, including over a year building them for Modesto businesses." },
      { name: "Distribution & Warehousing", line: "Barcode workflows and audited inventory, proven in pharmaceutical distribution." },
      { name: "Food Processing", line: "I haven't built for food processing yet, but pharma compliance is the same discipline." },
    ],
    economicContext:
      "Modesto and Stanislaus County are the heart of California's food processing industry. From wineries to almond and dairy processors, the region's businesses need software that handles compliance, traceability, and operational scale.",
    whyLocal:
      "I'm based in the Central Valley, a short drive from Modesto, and I've worked here. When something breaks before the morning shift, I'm not three timezones away.",
    faqs: [
      {
        question: "Do you build software for food processing companies?",
        answer:
          "I haven't built for food processing yet, but pharma compliance is the same discipline: lot tracking, audit trails, and excursion alerts. If that's the problem you have, I'm glad to talk through how it would carry over.",
      },
      {
        question: "Can you build AI-powered tools for my business?",
        answer:
          "Yes. I've built AI-powered grant discovery and matching systems using LLM parsing, semantic search, and scored matches. If you have a similar problem, I'm glad to talk it through.",
      },
      {
        question: "What is your typical project budget?",
        answer:
          `${offerLadderText()} Ongoing support is a monthly plan, scoped to what you run.`,
      },
      {
        question: "Do you offer ongoing support?",
        answer:
          "Yes. I offer monthly support for production systems: monitoring, backups, updates, bug fixes and performance work. New features are quoted separately.",
      },
    ],
    caseStudyConnectors: [
      { slug: "pharma-wms", connector: "The closest thing I've built to food-safety compliance: audit trails and excursion alerts." },
      { slug: "print-portal", connector: "A production floor taken from paper tickets to live queues." },
      { slug: "automation-rescue", connector: "For automations that grew piece by piece and stopped working." },
    ],
    localExperience: "Based in the Central Valley, I spent over a year in Modesto building WMS, ERP, and CRM systems for local businesses undergoing digital transformation.",
  },
  "manteca-tracy-lathrop": {
    slug: "manteca-tracy-lathrop",
    name: "Manteca, Tracy & Lathrop",
    cities: ["Manteca", "Tracy", "Lathrop"],
    region: "South San Joaquin County, CA",
    metaTitle: "Software Engineer in Manteca, Tracy & Lathrop, CA",
    metaDescription:
      "Senior full-stack engineer based in Manteca, building custom software for Manteca, Tracy, and Lathrop businesses running on paper and spreadsheets.",
    heroHeadline: "Your local engineer\nin Manteca, Tracy & Lathrop",
    heroSubheadline:
      "I live in Manteca. 20+ years building warehouse systems, production software, and the infrastructure under them, for businesses that can't afford to go down.",
    industries: [
      { name: "Warehousing & Distribution", line: "Barcode-driven workflows and real-time inventory, proven across four pharmaceutical distribution facilities." },
      { name: "Manufacturing", line: "Live production queues and job tracking in place of paper tickets." },
      { name: "Owner-Operated Businesses", line: "Custom software to replace the spreadsheets and disconnected tools you've outgrown." },
    ],
    economicContext:
      "The I-5 and 205 corridor through Tracy, Lathrop, and Manteca is one of the Central Valley's busiest warehouse and distribution areas, with plenty of family-owned businesses alongside it. Most of them run on software that has to work every shift.",
    whyLocal:
      "This is where I live. If you're in Manteca, Tracy, or Lathrop, I'm a short drive away, and the person you talk to is the person who built your system. When something breaks, you're not opening a ticket with someone three timezones away.",
    faqs: [
      {
        question: "Do you actually work on-site?",
        answer:
          "When it helps, yes. I live in Manteca, so sitting down with your team or walking your floor is easy to arrange. Most day-to-day work happens remotely.",
      },
      {
        question: "Do you build software for warehouses and distribution?",
        answer:
          "Yes. I built a pharmaceutical warehouse management system that handles $200M+ in annual distribution across 4 facilities, with barcode-driven workflows, real-time inventory, and compliance automation.",
      },
      {
        question: "What is your typical project budget?",
        answer:
          `${offerLadderText()} Ongoing support is a monthly plan, scoped to what you run.`,
      },
      {
        question: "Can you take over a system someone else built?",
        answer:
          "Yes. I start by figuring out what it actually does, then tell you plainly what it'll take. Legacy apps, WordPress sites, and automations have all landed on my desk that way.",
      },
    ],
    caseStudyConnectors: [
      { slug: "pharma-wms", connector: "The kind of warehouse problem this corridor runs on." },
      { slug: "print-portal", connector: "What it looks like when a production floor comes off paper." },
      { slug: "automation-rescue", connector: "Taking over a system nobody fully understood." },
    ],
    localExperience: "I live in Manteca, and I've spent years building software in Sacramento and Modesto.",
  },
};

export const locationSlugs = Object.keys(locations);

export function getLocation(slug: string): Location | undefined {
  return locations[slug];
}

export function getAllLocations(): Location[] {
  return Object.values(locations);
}
