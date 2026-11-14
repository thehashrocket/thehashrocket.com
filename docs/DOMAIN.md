# Domain Context — thehashrocket.com

## Who

Jason Shultz is a senior full-stack software engineer with 20+ years of experience. He builds custom web applications and the infrastructure under them, and leads infrastructure/engineering for a fleet of production sites while staying hands-on. Industries include pharmaceutical logistics, nonprofit technology, print production, e-commerce, and AI-powered data discovery.

## What This Site Is

A consulting site that doubles as a portfolio piece itself. It converts owner-operated and mid-size businesses by showing real project results, backed by technical craft (immersive 3D, scroll-driven narratives).

## Business Model

- Solo consulting/freelance engineering
- Target clients: owner-operated and mid-size businesses running on paper, spreadsheets, or software nobody wants to touch. Startups can still hire Jason; they just aren't the headline.
- Services: Build it (custom software), Rescue it (inherited, legacy, or AI-built systems), Keep it running (ongoing support on a monthly plan)
- Engagement: 20-minute call, then paid discovery with a written plan the client owns, then a fixed-scope build or monthly plan
- Automation sprint (`/automation-sprint`): one process automated for a fixed price set at scoping (range in `lib/offers.ts`), with one success metric, a 14-day acceptance window and a monthly cap. Owner-approved terms (2026-11-14 gate): up to `SPRINT_MAX_SYSTEMS` systems, data cleanup beyond the process quoted separately, a client-side delay over 5 business days pauses the clock, and a process change mid-sprint gets its own scope. Examples on the page must each have a case study behind them. This is the lead offer; pricing copy on the homepage, contact and location pages starts with it (`offerLadderText()`).
- Fixed-fee AI-built app review (`/ai-app-review`): one app built with AI or inherited, bounded scope, flat fee and turnaround set in `lib/offers.ts` (never hardcode a price anywhere else; `test/claims.test.ts` fails on any price literal). It replaces paid discovery for that app, and the fee is credited toward a fix or sprint started within `REVIEW_CREDIT_DAYS`, up to that work's price. A code and configuration review, not a penetration test. Never claim exclusivity or a count of past AI-app rescues.
- Vertical page: `/print-shops`, built on the one Print Portal client. Say "a print shop", never imply many.
- Free talk (`/talks`): a free talk for chambers, SBDCs and business groups, length in `lib/offers.ts` (`TALK_MINUTES_MIN`–`TALK_MINUTES_MAX`), in person in the Sacramento, Stockton and Modesto areas or online. The owner writes the title (`TALK_TITLE` in `lib/talk.ts`, 60 characters max) and the takeaways. No price on the page; in-house workshops are on request. It feeds the sprint and the review, not a paid speaking line.
- Coming later (values already in `lib/offers.ts`): a monthly care plan (`/care-plan`), built when the first sprint or review is delivered. Do not link it until it ships; `test/routes.test.ts` fails on links to pages that don't exist.
- Positioning: premium senior engineer. Small fixed-scope entry offers (an AI-built app review, an automation sprint) lead to custom builds, which start at $10,000.
- Primary conversion: booking a call on Cal.com, with the contact form second

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

The `/lab` page lists side projects from `lib/side-projects.ts`.

**Claims rule:** only publish a claim the owner can defend on a sales call. Cut anything without a case study behind it, and don't name institutions Jason hasn't worked with. `test/claims.test.ts` fails on known-bad claims, but it cannot tell whether a number is true.

**Confidentiality rule:** never name clients or employers in case studies, timeline, copy, or images, including screenshots and logos in photos. Describe them generically ("a print company", "an agency"). Avoid incident details that would embarrass a client or employer.

Case study content (descriptions, tech stacks, narratives) lives in `lib/case-studies.ts`. This file is the source of truth for project details — do not duplicate here.

## Brand Identity

- Technical, not flashy. "I build systems that work."
- The 3D scenes are visual metaphors for each project's domain, not decoration
- Dark, precise aesthetic — like a well-designed terminal
- Green (#4ade80) accent = terminal, systems, alive
- Full design system in `docs/DESIGN.md`
