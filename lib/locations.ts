export interface FAQ {
  question: string;
  answer: string;
}

export interface CaseStudyConnector {
  slug: string;
  connector: string;
}

export interface Location {
  slug: string;
  name: string;
  region: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  industries: string[];
  economicContext: string;
  whyLocal: string;
  faqs: FAQ[];
  caseStudyConnectors: CaseStudyConnector[];
}

export const locations: Record<string, Location> = {
  sacramento: {
    slug: "sacramento",
    name: "Sacramento",
    region: "Sacramento County, CA",
    metaTitle: "Software Engineer in Sacramento, CA",
    metaDescription:
      "Senior full-stack engineer in Sacramento building complex systems for startups and enterprises. Custom software, AI pipelines, warehouse logistics, and more.",
    heroHeadline: "I build complex systems\nfor Sacramento businesses",
    heroSubheadline:
      "25 years engineering high-stakes software. State government modernization, health tech compliance, AI research pipelines — if Sacramento's tech ecosystem needs it built right, I've done it.",
    industries: [
      "Government & Public Sector",
      "Healthcare & Life Sciences",
      "AgTech & Food Systems",
      "Clean Energy & Climate Tech",
    ],
    economicContext:
      "Sacramento is California's capital and a growing tech hub. With major healthcare systems like UC Davis Health and Sutter Health, a booming government technology sector, and an emerging AgTech corridor, the region needs engineers who understand both enterprise scale and startup speed.",
    whyLocal:
      "Based in the Central Valley, I understand the unique challenges Sacramento businesses face — bridging the gap between Silicon Valley expectations and local operational realities. I work directly with teams here, no timezone juggling required.",
    faqs: [
      {
        question: "What types of software do you build for Sacramento businesses?",
        answer:
          "I build custom web applications, internal tools, data pipelines, and AI-powered systems. Recent work includes warehouse management systems handling $200M+ in distribution, nonprofit matching platforms, and AI grant discovery tools.",
      },
      {
        question: "Do you work with Sacramento government agencies?",
        answer:
          "Yes. I have experience building systems that meet government compliance requirements, including audit trails, role-based access control, and data security standards.",
      },
      {
        question: "What is your typical project budget?",
        answer:
          "Projects typically start at $10,000 for focused builds. Enterprise engagements and ongoing consulting relationships are scoped individually based on complexity and timeline.",
      },
      {
        question: "How do you handle ongoing maintenance?",
        answer:
          "I offer retainer-based support for production systems. This includes monitoring, bug fixes, performance optimization, and incremental feature development.",
      },
    ],
    caseStudyConnectors: [
      { slug: "pharma-wms", connector: "The kind of operational complexity Sacramento's health tech corridor produces." },
      { slug: "nonprofit-matching", connector: "Connecting communities through intelligent systems — the kind of civic tech Sacramento needs." },
      { slug: "grant-discovery", connector: "AI-powered systems like UC Davis research programs need." },
    ],
  },
  stockton: {
    slug: "stockton",
    name: "Stockton",
    region: "San Joaquin County, CA",
    metaTitle: "Software Engineer in Stockton & San Joaquin County, CA",
    metaDescription:
      "Senior full-stack engineer serving Stockton and San Joaquin County. Custom software for logistics, agriculture, and supply chain operations.",
    heroHeadline: "Senior engineering for\nSan Joaquin County businesses",
    heroSubheadline:
      "25 years building the systems that power logistics, distribution, and community services. From warehouse management to nonprofit matching — complex problems solved directly, 1:1.",
    industries: [
      "Logistics & Supply Chain",
      "Agriculture & Food Processing",
      "Port & Maritime Operations",
      "Manufacturing & Distribution",
    ],
    economicContext:
      "Stockton sits at the crossroads of California logistics. The Port of Stockton, one of the state's busiest inland ports, drives a massive logistics and distribution network. Combined with San Joaquin County's agricultural output — one of the top-producing counties in the nation — the region runs on operational software that needs to be reliable, fast, and auditable.",
    whyLocal:
      "I live in the Central Valley and work directly with local businesses. When your warehouse management system needs a fix at 6am before the morning shift, I'm not three timezones away. I understand the operational tempo of logistics and agriculture-driven businesses.",
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
          "Projects typically start at $10,000 for focused builds. Enterprise engagements and ongoing consulting relationships are scoped individually based on complexity and timeline.",
      },
      {
        question: "How quickly can you start on a new project?",
        answer:
          "I typically begin discovery within one week of engagement. For urgent operational issues, I can provide same-day consulting to assess the situation and plan a fix.",
      },
    ],
    caseStudyConnectors: [
      { slug: "pharma-wms", connector: "Logistics systems built for the distribution networks running through San Joaquin County." },
      { slug: "nonprofit-matching", connector: "Connecting Central Valley nonprofits with the communities that need them." },
      { slug: "grant-discovery", connector: "Data-driven tools for the research and agricultural institutions across the region." },
    ],
  },
  modesto: {
    slug: "modesto",
    name: "Modesto",
    region: "Stanislaus County, CA",
    metaTitle: "Software Engineer in Modesto & Stanislaus County, CA",
    metaDescription:
      "Senior full-stack engineer serving Modesto and Stanislaus County. Custom software for food processing, agriculture, healthcare, and manufacturing.",
    heroHeadline: "Complex software systems\nfor Stanislaus County",
    heroSubheadline:
      "25 years of engineering for industries that can't afford failure. Agricultural supply chains, pharmaceutical distribution, data-driven nonprofits — built by a senior engineer, not an agency.",
    industries: [
      "Food Processing & Safety",
      "Agriculture & Dairy",
      "Healthcare Systems",
      "Manufacturing & Quality Control",
    ],
    economicContext:
      "Modesto and Stanislaus County are the heart of California's food processing industry. From Gallo Winery to major almond and dairy processors, the region's businesses need software that handles compliance, traceability, and operational scale. Healthcare systems like Doctors Medical Center also drive demand for reliable, secure software.",
    whyLocal:
      "I'm based in the Central Valley, minutes from Modesto. I understand the food safety compliance requirements, agricultural cycles, and manufacturing workflows that drive business here. Local presence means faster response times and better understanding of your operations.",
    faqs: [
      {
        question: "Do you build software for food processing companies?",
        answer:
          "Yes. I build traceability systems, compliance tracking, and operational dashboards for food processing and manufacturing. My experience with pharmaceutical warehouse compliance translates directly to food safety requirements like FSMA.",
      },
      {
        question: "Can you build AI-powered tools for my business?",
        answer:
          "Yes. I've built AI-powered grant discovery systems and intelligent matching platforms. I can apply similar techniques to document processing, quality inspection, demand forecasting, and other data-intensive problems.",
      },
      {
        question: "What is your typical project budget?",
        answer:
          "Projects typically start at $10,000 for focused builds. Enterprise engagements and ongoing consulting relationships are scoped individually based on complexity and timeline.",
      },
      {
        question: "Do you offer ongoing support?",
        answer:
          "Yes. I offer retainer-based support that includes monitoring, bug fixes, performance optimization, and incremental feature development for production systems.",
      },
    ],
    caseStudyConnectors: [
      { slug: "pharma-wms", connector: "Supply chain software for the agricultural and pharma distribution hubs in Stanislaus County." },
      { slug: "nonprofit-matching", connector: "Matching technology for the nonprofit organizations serving rural Central Valley." },
      { slug: "grant-discovery", connector: "AI-powered discovery tools for research institutions and agricultural programs." },
    ],
  },
};

export const locationSlugs = Object.keys(locations);

export function getLocation(slug: string): Location | undefined {
  return locations[slug];
}

export function getAllLocations(): Location[] {
  return Object.values(locations);
}
