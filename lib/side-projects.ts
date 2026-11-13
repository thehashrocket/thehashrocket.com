export interface SideProject {
  slug: string;
  name: string;
  status: string;
  description: string;
  tags: string[];
  url?: string;
}

// The Lab: things built for fun or for my own use. Keep descriptions factual;
// no client or employer names (see docs/DOMAIN.md confidentiality rule).
export const sideProjects: SideProject[] = [
  {
    slug: "money",
    name: "Money",
    status: "In daily use",
    description:
      "My own budgeting app, plus an MCP server I maintain so I can ask Claude where the money went. It categorizes transactions, adjusts budget allocations, tracks goals, and spots subscriptions, so I don't have to open a spreadsheet.",
    tags: ["MCP", "AI tooling", "Personal finance"],
  },
  {
    slug: "skywave",
    name: "Skywave",
    status: "Live",
    description:
      "Shortwave and ham radio in the browser, no radio or antenna required. It picks a public KiwiSDR receiver for the frequency you want, streams the audio, and shows a live waterfall you can click to tune. A map shows where the receivers are and which parts of the world are dark, which is when distant stations come in.",
    tags: ["Next.js", "Python", "DSP", "KiwiSDR"],
    url: "https://skywavehf.com/",
  },
  {
    slug: "volunteerready",
    name: "VolunteerReady",
    status: "Pre-launch",
    description:
      "A two-sided marketplace matching volunteers with the nonprofits that need them. The platform and localized landing pages for California cities and counties are built. The cold-start plan is to sign up nonprofits first.",
    tags: ["SaaS", "Marketplace", "Nonprofit", "Local SEO"],
    url: "https://volunteerready.org/",
  },
  {
    slug: "home-lab",
    name: "Automation Lab",
    status: "Running",
    description:
      "A self-hosted n8n instance on EC2 with Postgres, Ollama for local models, and Qdrant for vector search, all under Docker Compose. It runs my own automations, like piping GitHub activity into Slack.",
    tags: ["n8n", "Docker Compose", "Ollama", "Qdrant"],
  },
];
