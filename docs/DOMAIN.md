# Domain Context — thehashrocket.com

## Who

Jason Shultz is a senior full-stack software engineer with 20+ years of experience. He builds custom web applications and the infrastructure under them, and leads infrastructure/engineering for a fleet of production sites while staying hands-on. Industries include pharmaceutical logistics, nonprofit technology, print production, e-commerce, and AI-powered data discovery.

## What This Site Is

A creative developer portfolio that doubles as a portfolio piece itself. The site converts potential consulting/freelance clients by demonstrating both technical craft (immersive 3D, scroll-driven narratives) and real-world project impact.

## Business Model

- Solo consulting/freelance engineering
- Target clients: startups and growing businesses that need custom web applications, legacy platform rescues, or infrastructure help
- Positioning: premium (budget range starts at $10k)
- Primary conversion: contact form inquiry

## Project Domains

The portfolio showcases eight projects (order matches `lib/case-studies.ts`):

1. **Pharma WMS** — Warehouse management for pharmaceutical distribution.
2. **Print Portal** — Production management portal for a print shop.
3. **Storefront Consolidation** — Nine legacy Magento storefronts → one multi-tenant Next.js platform.
4. **WordPress Modernization** — Legacy WordPress sites moved off an unmaintained provisioning stack onto PHP 8, Git deploys, managed hosting.
5. **Fleet Security Audit** — Scripted audit of 125 sites across 8 EC2 servers, prioritized remediation plan.
6. **Automation Rescue** — Assessment and remediation of an n8n/Airtable/Microsoft Graph recruiting pipeline.
7. **Nonprofit Matching** — Donor/organization matching on a graph model.
8. **Grant Discovery** — AI-powered grant matching and application tracking.

The homepage **Lab** section lists side projects from `lib/side-projects.ts`.

**Confidentiality rule:** never name clients or employers in case studies, timeline, or copy. Describe them generically ("a print company", "an agency"). Avoid incident details that would embarrass a client or employer.

Case study content (descriptions, tech stacks, narratives) lives in `lib/case-studies.ts`. This file is the source of truth for project details — do not duplicate here.

## Brand Identity

- Technical, not flashy. "I build systems that work."
- The 3D scenes are visual metaphors for each project's domain, not decoration
- Dark, precise aesthetic — like a well-designed terminal
- Green (#4ade80) accent = terminal, systems, alive
- Full design system in `docs/DESIGN.md`
