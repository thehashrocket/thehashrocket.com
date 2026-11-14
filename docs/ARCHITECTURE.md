# Architecture — thehashrocket.com

## Overview

Consulting site for owner-operated and mid-size businesses, built with Next.js 16 (App Router), React 19, and React Three Fiber v9. The site uses a persistent 3D canvas overlaid with DOM content, scroll-driven scene transitions, and progressive WebGL enhancement.

## Component Tree

```
app/layout.tsx (Server Component — metadata, fonts, JSON-LD)
  ├── <Nav />                              (client — responsive nav + mobile hamburger)
  ├── <SceneProvider />                    (client — persistent 3D canvas wrapper)
  │   ├── <ErrorBoundary>                  (catches WebGL failures)
  │   │   └── <SceneCanvas />              (lazy-loaded via next/dynamic, ssr: false)
  │   │       └── <SceneRouter />          (reads Zustand store, renders active scene)
  │   │           ├── <HeroScene />        (wireframe icosahedron + particles)
  │   │           ├── <PharmaScene />      (warehouse conveyor visualization)
  │   │           ├── <NonprofitScene />   (graph node reveal driven by scroll)
  │   │           ├── <GrantScene />       (particle cluster scatter animation)
  │   │           └── <PrintPortalScene /> (pipeline flow across 4 print stations)
  │   └── {children}                       (page content, overlaid on canvas)
  │       └── <SceneSync />                (sr-only sentinel — syncs DOM ↔ Zustand scene state)
  └── <Footer />
```

## Key Architectural Decisions

**Persistent canvas:** The R3F `<Canvas>` lives in the root layout, always mounted. Individual pages dispatch scene changes to a Zustand store rather than mounting their own canvases. This avoids WebGL context creation/destruction on navigation.

**Lazy-loaded three.js:** three.js is ~150KB gzip. `SceneCanvas` is loaded via `next/dynamic` with `ssr: false`. A static fallback image serves as both the loading state and the LCP element.

**Zustand scene state:** `lib/store.ts` manages `currentScene`, `scrollProgress`, and `morphRunning`. Pages set the scene; the canvas reads it. No prop drilling through the component tree.

**Progressive enhancement:** `lib/webgl.ts` detects WebGL support (cached per session). `SceneCanvas` checks support via `useEffect` before mounting the R3F Canvas — unsupported devices get `StaticFallback` without ever attempting WebGL context creation. `ErrorBoundary` remains as a safety net for runtime context loss. The site is fully functional without WebGL.

**Contact form:** Server Action in `lib/actions.ts`. Honeypot spam protection + Upstash Redis rate limiting (fail-open if Redis unavailable). Email delivery via Resend. Source attribution tracks which page referred the lead; `source` is allow-listed in `lib/sources.ts`, then goes to the notification email and the Cal.com link. Nothing on the site stores it. A known offer-page source (`automation-sprint`, `ai-app-review`, `care-plan`, `print-shops`) also preselects the form's project type through `projectTypeForSource` in `lib/contact-options.ts`; the visitor can still change it. The intro above the form comes from `contactIntro()` in `lib/contact-intro.ts`: offer sources name their offer, talk sources (`talks`, `talk-attendee`) show no prices and `talks` hides the timeline field. The email subject (`contactSubject()` in `lib/contact-email.ts`) is `New contact from {name} - {projectType} (via {source})`, each part only when present. The rate limiter keys on `x-real-ip` (falling back to the first `x-forwarded-for` entry). `TEST_EMAIL_ENABLED=true` skips both the limiter and the email so e2e runs never spend Upstash quota, but only outside production: when `VERCEL_ENV` is `production` the flag is ignored.

**Canvas dimming:** `CaseStudyScroll` sets `canvasDimmed` in the store once the narrative reaches the lower quarter of the viewport, and `SceneCanvas` drops the whole canvas to 20% opacity. Doing it at the canvas covers every scene. It stays dim past the narrative because the closing CTA sits on the canvas too.

**Booking:** `lib/site.ts` is the only reader of `NEXT_PUBLIC_CALCOM_URL`. `BookingLink` falls back to the contact form when it is unset or unusable (`fallback="hide"` renders nothing instead). Offer-page heroes use `OfferHeroActions`, which keeps exactly one `data-testid="booking-cta"` per page in both states.

**Geo landing pages:** Data-driven architecture via `lib/locations.ts`. Each city gets a statically generated page at `/locations/[slug]` with `dynamicParams = false`. Adding a new city is config-only: add an entry to `lib/locations.ts` and it automatically gets a page, OG image, sitemap entry, and JSON-LD structured data. Cities with `localExperience` get a career credibility block in the "Why a local engineer?" card.

**Career data:** `lib/experience.ts` holds typed career entries, the core stack, and domain tags. Consumed by the About page (timeline + stack and domain lists) and validated against `lib/locations.ts` slugs. The `Timeline` component uses progressive disclosure (expanded/compact/condensed tiers) with responsive behavior and scroll-reveal animations.

## Data Flow

```
User scrolls page
  → CaseStudyScroll IntersectionObserver / scroll handler fires
    → calls useSceneStore.setScrollProgress(n)
      → SceneRouter reads progress
        → Active scene component animates to position n

User clicks atlas card
  → useSceneStore.startMorph("pharma-wms")
    → SceneRouter transitions scene
      → router.push("/work/pharma-wms")
        → New page sets scene via useSceneStore
```

## Directory Structure

```
app/                    Routes (App Router)
  ├── page.tsx          Homepage (hero, proof strip, services, selected work, why me, how it works, CTA)
  ├── opengraph-image.tsx  Homepage OG image (1200×630 via next/og)
  ├── about/            About page + opengraph-image.tsx
  ├── automation-sprint/ Fixed-price automation sprint offer + opengraph-image.tsx (Service AggregateOffer + FAQ JSON-LD)
  ├── ai-app-review/    Fixed-fee AI-built app review offer + opengraph-image.tsx (Service + FAQ JSON-LD)
  ├── contact/          Contact form + opengraph-image.tsx
  ├── lab/              Side projects page + opengraph-image.tsx
  ├── work/             Case studies index + opengraph-image.tsx
  │   └── [slug]/       Individual case study + opengraph-image.tsx
  ├── print-shops/      Print shop vertical page from the Print Portal case study + opengraph-image.tsx (FAQ JSON-LD)
  ├── locations/        Geo landing pages hub + opengraph-image.tsx
  │   └── [slug]/       City page + opengraph-image.tsx (per-city dynamic OG)
  ├── layout.tsx        Root layout (canvas + nav + footer + analytics + JSON-LD)
  └── not-found.tsx     404 with persistent canvas
components/
  ├── layout/           Shell components (Nav, Footer, SceneProvider, ErrorBoundary, JsonLd, LocationJsonLd)
  ├── scenes/           R3F scene components (HeroScene, PharmaScene, NonprofitScene, GrantScene, PrintPortalScene, ConsolidationScene, ModernizeScene, AuditScene, AutomationScene, SceneRouter)
  └── ui/               UI primitives (Button, Card, Input, ContactForm, AtlasCard, BookingLink, OfferHeroActions, ClosingCta, NumberedSteps, ArchitectureDiagram, LabSection, Timeline, SceneSync) and `styles.ts` (shared section class strings)
      └── geo/          Geo landing page sections (Hero, Services, CaseStudies, FAQ, CTA)
lib/
  ├── store.ts          Zustand scene state
  ├── actions.ts        Server Actions (contact form with TEST_EMAIL_ENABLED guard)
  ├── contact-options.ts  Contact form project types, timelines, and project type preselected by ?source=
  ├── constants.ts      Shared constants (MORPH_DURATION_MS, CONTACT_FORM_TIMEOUT_MS)
  ├── hooks.ts          Reusable hooks (usePrefersReducedMotion, useMediaQuery)
  ├── case-studies.ts   Shared case study data (used by homepage, work, geo pages)
  ├── experience.ts     Career data (entries, core stack, domains — used by about, timeline)
  ├── offers.ts         Every offer number, the formatters (formatUsd, formatUsdRange, formatUsdCompact) and the pricing ladder (offerLadderParts/Text); type-only imports so client code may use it
  ├── offer-content.ts  Review and sprint page copy (server components only)
  ├── contact-intro.ts  /contact intro text per source
  ├── contact-email.ts  Contact email subject
  ├── print-shops.ts    /print-shops copy (results and workflow come from the print-portal case study)
  ├── locations.ts      City configs (Sacramento, Stockton, Modesto, Manteca/Tracy/Lathrop) with optional localExperience
  ├── side-projects.ts  Side project data (used by /lab)
  ├── site.ts           Contact email, social URLs, booking and contact link helpers, and `OFFER_ROUTES` (the offer pages the sitemap and metadata tests iterate)
  ├── sources.ts        ?source= allow-list
  ├── fonts.ts          next/font configuration (Space Grotesk, Inter, JetBrains Mono)
  ├── og-fonts.ts       Promise-based font loader for OG image generation (cached, retry-on-failure)
  ├── og-image.tsx      Shared OG image template component (1200×630, Space Grotesk/Inter)
  └── webgl.ts          WebGL feature detection
docs/                   Project documentation
test/                   Vitest test suite
public/                 Static assets
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Server components, file-based routing, Vercel deployment |
| 3D | React Three Fiber v9 + drei | Declarative three.js, React 19 compatible |
| State | Zustand | Minimal, no provider needed, works across client components |
| Styling | Tailwind CSS v4 | Utility-first, CSS custom properties for design tokens |
| Animation | Motion (Framer Motion) | Page transitions, scroll reveals |
| Email | Resend | Transactional email for contact form |
| Rate limiting | Upstash Redis | Serverless-compatible, fail-open |
| Analytics | @vercel/analytics | Page-level tracking |
| Runtime | Node 24 (Active LTS) | Pinned three places that must agree: `.nvmrc` (24.19.0) for local and CI, `engines.node` (`24.x`) for the Vercel build, and `@types/node` (`^24`) for the compiler. `test/typescript-toolchain.test.ts` fails if they drift — types ahead of the runtime make typecheck pass for code that throws in production |
| Package manager | pnpm | `pnpm-lock.yaml` is the only committed lockfile. Security pins for transitive deps live in the `overrides` block of `pnpm-workspace.yaml`, which npm ignores — see CLAUDE.md. `postcss`, `sharp`, and scoped pins for `minimatch` and `glob` are the only overrides; see CLAUDE.md |
| Language | TypeScript 6 (+ 7 alongside) | `typescript` stays on 6 because typescript-eslint cannot load TypeScript 7. TS 7 is installed as the `typescript7` alias for `pnpm run typecheck:fast` (~5x faster, local only). Never invoke a bare `tsc` — the alias owns `node_modules/.bin/tsc`. See CLAUDE.md |
| Testing | Vitest + Testing Library | Unit tests for forms, store, hooks, scene sync, AtlasCard, WebGL detection, geo pages, JSON-LD, metadata, sitemap, OG utilities, booking CTAs, source allow-list, offer pages and offer data, contact intro per source and project-type preselect, internal links resolving to pages, published claims including a value-independent price-literal ban, and the Dependabot/CI/TypeScript-toolchain/security-override/Playwright config — 283 tests |
| E2E | Playwright | 24 tests across 4 spec files in `test/e2e/` covering contact form (honeypot, native constraint validation, happy path), scene-wiring sentinel assertions, site structure (Lab page, nav, footer, Manteca page, qualifying fields), and the offer pages (`/automation-sprint`, `/ai-app-review` and `/print-shops` without WebGL, tagged CTAs, keyboard focus, first screen at 375×667 and no sideways scroll at 320px, contact preselect and a sprint submission, cross-links). Runs on a dedicated port (3178, override with `E2E_PORT`) and always starts its own server — it will not adopt an unrelated process on 3000. All green as of 0.4.0.0. Not run in CI — see TODOS.md |
| CI | GitHub Actions | `.github/workflows/ci.yml` — frozen-lockfile install, `pnpm audit`, lint (non-blocking), `pnpm run typecheck`, unit tests, production build on every PR |
| Supply chain | `pnpm audit` in CI | Advisory for humans, blocking for the Dependabot security PRs that auto-merge unattended. The blocking form is scoped to the exact set that merges without review and to the dependency class each can fix (`--prod` / `--dev`). `--ignore-unfixable` runs first to list advisories with no published fix, then a plain scoped audit does the blocking, so a fixable advisory the PR does not resolve holds it for a human. A held PR gets a `needs-review` label and a comment |
| Dependency updates | Dependabot | Daily. Security patches (patch/minor) auto-approve and squash-merge once CI passes; majors get a `needs-review` label |
| Deploy | Vercel | Automatic from GitHub push to main |

## Known Constraints

- Root layout wraps children in client boundary (SceneProvider) — prevents server component rendering for page content. Acceptable for v1 static portfolio.
- Mobile: SceneRouter mounts all scenes unconditionally; the mobile-only hero policy is deferred (see TODOS.md)
