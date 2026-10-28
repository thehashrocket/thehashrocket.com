export interface CareerEntry {
  description: string;
  role: string;
  startYear: number;
  endYear: number | null;
  location: string;
  locationSlug?: string;
  highlights: string[];
  technologies: string[];
}

export const careerEntries: CareerEntry[] = [
  {
    description: "Web platforms, infrastructure, and ERP/CRM for printing and manufacturing",
    role: "Engineering Lead & Senior Software Engineer",
    startYear: 2021,
    endYear: null,
    location: "Remote",
    highlights: [
      "Lead infrastructure and engineering for a fleet of cloud servers and 125+ production sites while staying hands-on in the code",
      "Ran a fleet-wide security audit and remediation program, from scripted discovery to a prioritized, estimated workplan",
      "Consolidating nine legacy e-commerce storefronts into a single multi-tenant Next.js platform",
      "Modernized aging WordPress sites onto PHP 8, Git-based deploys, and managed hosting",
      "Built a CRM system for a commercial printing company, improving sales workflow efficiency by 19%",
      "Developed ERP modules for inventory management and production scheduling",
      "Migrated legacy systems to modern Rails and React stack",
    ],
    technologies: ["Next.js", "TypeScript", "tRPC", "Prisma", "PostgreSQL", "Ruby on Rails", "AWS", "WordPress", "n8n"],
  },
  {
    description: "Digital transformation consulting",
    role: "Senior Software Engineer",
    startYear: 2020,
    endYear: 2021,
    location: "Modesto, CA",
    locationSlug: "modesto",
    highlights: [
      "Led digital transformation for local businesses transitioning from manual to automated workflows",
      "Built WMS, ERP, and CRM systems for companies undergoing operational modernization",
    ],
    technologies: ["Ruby on Rails", "React", "PostgreSQL", "Redis", "Docker"],
  },
  {
    description: "Pharmaceutical distribution and logistics",
    role: "Software Engineer",
    startYear: 2018,
    endYear: 2020,
    location: "Sacramento, CA",
    locationSlug: "sacramento",
    highlights: [
      "Built a warehouse management system handling $200M+ in annual pharmaceutical distribution",
      "Designed barcode-driven workflows and real-time inventory tracking across 4 facilities",
      "Achieved 98% reduction in compliance incidents",
    ],
    technologies: ["Ruby on Rails", "React", "PostgreSQL", "Redis", "AWS"],
  },
  {
    description: "EdTech SaaS platform",
    role: "Software Engineer",
    startYear: 2016,
    endYear: 2018,
    location: "Remote",
    highlights: [
      "Developed features for a learning management platform serving thousands of educators",
      "Built real-time collaboration tools and assessment engines",
    ],
    technologies: ["Ruby on Rails", "Vue.js", "PostgreSQL", "ElasticSearch"],
  },
  {
    description: "Nonprofit and civic technology",
    role: "Software Engineer",
    startYear: 2014,
    endYear: 2016,
    location: "Sacramento, CA",
    locationSlug: "sacramento",
    highlights: [
      "Built donor matching and community engagement platforms",
      "Developed data pipelines for grant discovery and impact reporting",
    ],
    technologies: ["Ruby on Rails", "Angular", "PostgreSQL", "GraphQL"],
  },
  {
    description: "Web development and consulting",
    role: "Web Developer",
    startYear: 2012,
    endYear: 2014,
    location: "Sacramento, CA",
    locationSlug: "sacramento",
    technologies: ["Ruby on Rails", "JavaScript", "MySQL", "HTML5", "CSS3"],
    highlights: [],
  },
];

export const skills = {
  languages: ["TypeScript", "Ruby", "JavaScript", "Python", "PHP", "SQL", "HTML5", "CSS3"],
  frameworks: ["Next.js", "React", "tRPC", "Prisma", "Ruby on Rails", "Node.js", "WordPress", "GraphQL", "Vue.js", "Angular"],
  databases: ["PostgreSQL", "MySQL", "ElasticSearch", "MongoDB", "Redis"],
  infrastructure: ["AWS (EC2, S3, RDS, SES, VPC)", "Docker", "nginx", "Apache", "Managed WordPress hosting", "n8n", "CI/CD"],
};

export const domains = [
  "EdTech",
  "Pharma & Logistics",
  "Nonprofit & Civic Tech",
  "Manufacturing",
  "Digital Transformation",
  "E-commerce",
  "Security & Infrastructure",
  "Healthcare",
  "AI & Data",
];
