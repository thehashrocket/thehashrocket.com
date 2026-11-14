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

**Contact form:** Server Action in `lib/actions.ts`. Honeypot spam protection + Upstash Redis rate limiting (fail-open if Redis unavailable). Email delivery via Resend. Source attribution tracks which page referred the lead; `source` is allow-listed in `lib/sources.ts`, then goes to the notification email and the Cal.com link. Nothing on the site stores it. A known offer-page source (`automation-sprint`, `ai-app-review`, `care-plan`, `print-shops`, `talks`) also preselects the form's project type through `projectTypeForSource` in `lib/contact-options.ts`; the visitor can still change it. The intro above the form comes from `contactIntro()` in `lib/contact-intro.ts`: offer sources name their offer and talk sources (`talks`, `talk-attendee`) show no prices. The form's "What happens next" steps and its timeline field follow the project type the visitor currently has selected (`contactFlowFor()` in `lib/contact-options.ts`): "A talk for my group" shows the talk steps and no timeline. The select is uncontrolled so every form reset restores the preselected type; `onChange` and `onReset` mirror it into state. The email subject (`contactSubject()` in `lib/contact-email.ts`) is `New contact from {name} - {projectType} (via {source})`, each part only when present. The rate limiter keys on `x-real-ip` (falling back to the first `x-forwarded-for` entry). `TEST_EMAIL_ENABLED=true` skips both the limiter and the email so e2e runs never spend Upstash quota, but only outside production: when `VERCEL_ENV` is `production` the flag is ignored.

**Canvas dimming:** `useDimCanvasBelow(ref, threshold)` in `lib/hooks.ts` sets `canvasDimmed` in the store once the element rises above `threshold` of the viewport, and `SceneCanvas` drops the whole canvas to 20% opacity. Doing it at the canvas covers every scene, and it stays dim below that point because the closing CTA sits on the canvas too. `CaseStudyScroll` uses it at 0.75; offer pages place `<DimCanvasBelow />` (0.5, so 1440×900 screens load bright) right after the hero. One dimming owner per page: both reset the flag on unmount, and `test/dim-canvas-below.test.tsx` fails on a page that renders both.

**Booking:** `lib/site.ts` is the only reader of `NEXT_PUBLIC_CALCOM_URL`. `BookingLink` falls back to the contact form when it is unset or unusable (`fallback="hide"` renders nothing instead). Offer-page heroes use `OfferHeroActions`, which keeps exactly one `data-testid="booking-cta"` (the hero's primary action) per page in both states. `lead="message"` puts the message link first, as on `/talks`; `messageLabel` and `bookingLabel` rename the two actions.

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

## Adding or changing an offer page

1. Numbers go in `lib/offers.ts` (the only file allowed to type a price; `test/claims.test.ts` enforces it). Copy goes in `lib/offer-content.ts`.
2. Copy `app/automation-sprint/page.tsx`: hero with `offer-summary` and `offer-scope`, `<OfferHeroActions source=…/>`, then `<DimCanvasBelow />` right after the hero section. Add an `opengraph-image.tsx` beside it.
3. Add the route to `OFFER_ROUTES` and a date to `OFFER_ROUTE_UPDATED` in `lib/site.ts` (the sitemap reads both), and a row to the `offerMetadata` record in `test/metadata.test.ts`.
4. Allow-list the source in `lib/sources.ts`, map it in `PROJECT_TYPE_BY_SOURCE` (`lib/contact-options.ts`) and give it a line in `contactIntro()` (`lib/contact-intro.ts`).
5. Add a `pages` row in `test/e2e/offer-pages.spec.ts` (`h1`, `fact`, `ctaText`, `firstScreen: 667 | 560 | false`); a test fails until every `OFFER_ROUTES` entry has one. `test/e2e/offer-dimming.spec.ts` picks the route up on its own.
6. Run `pnpm run typecheck && pnpm test && pnpm run test:e2e`. Typecheck first: a missing metadata row is a compiler error there. For a trace, `pnpm exec playwright test --trace on <spec>`.

E2E runs two dev servers: port 3178 with booking off, and port 3179 with a fake Cal.com URL and its own build directory (`NEXT_DIST_DIR=.next-booking`, since Next 16 locks one dev server per directory). The `booking-on` project only runs the first-screen checks.

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
  ├── talks/            Free talk for chambers, SBDCs and business groups + opengraph-image.tsx (no JSON-LD)
  ├── locations/        Geo landing pages hub + opengraph-image.tsx
  │   └── [slug]/       City page + opengraph-image.tsx (per-city dynamic OG)
  ├── layout.tsx        Root layout (canvas + nav + footer + analytics + JSON-LD)
  └── not-found.tsx     404 with persistent canvas
components/
  ├── layout/           Shell components (Nav, Footer, SceneProvider, ErrorBoundary, JsonLd, LocationJsonLd)
  ├── scenes/           R3F scene components (HeroScene, PharmaScene, NonprofitScene, GrantScene, PrintPortalScene, ConsolidationScene, ModernizeScene, AuditScene, AutomationScene, SceneRouter)
  └── ui/               UI primitives (Button, Card, Input, ContactForm, AtlasCard, BookingLink, OfferHeroActions, DimCanvasBelow, ClosingCta, NumberedSteps, ArchitectureDiagram, LabSection, Timeline, SceneSync) and `styles.ts` (shared section class strings)
      └── geo/          Geo landing page sections (Hero, Services, CaseStudies, FAQ, CTA)
lib/
  ├── store.ts          Zustand scene state
  ├── actions.ts        Server Actions (contact form with TEST_EMAIL_ENABLED guard)
  ├── contact-options.ts  Contact form project types, timelines, and project type preselected by ?source=
  ├── constants.ts      Shared constants (MORPH_DURATION_MS, CONTACT_FORM_TIMEOUT_MS)
  ├── hooks.ts          Reusable hooks (usePrefersReducedMotion, useMediaQuery, useDimCanvasBelow)
  ├── case-studies.ts   Shared case study data (used by homepage, work, geo pages)
  ├── experience.ts     Career data (entries, core stack, domains — used by about, timeline)
  ├── offers.ts         Every offer number, the formatters (formatUsd, formatUsdRange, formatUsdCompact) and the pricing ladder (offerLadderParts/Text); type-only imports so client code may use it
  ├── offer-content.ts  Review, sprint and talks page copy (server components only)
  ├── talk.ts           TALK_TITLE and the takeaways (leaf module; tests import the exact strings)
  ├── contact-intro.ts  /contact intro text per source
  ├── contact-email.ts  Contact email subject
  ├── print-shops.ts    /print-shops copy (results and workflow come from the print-portal case study)
  ├── locations.ts      City configs (Sacramento, Stockton, Modesto, Manteca/Tracy/Lathrop) with optional localExperience
  ├── side-projects.ts  Side project data (used by /lab)
  ├── site.ts           Contact email, social URLs, booking and contact link helpers, `OFFER_ROUTES` (offer and talk pages: the sitemap, metadata, first-screen and dimming checks iterate it) and `OFFER_ROUTE_UPDATED` (their sitemap dates)
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
| Testing | Vitest + Testing Library | Unit tests for forms, store, hooks, scene sync, AtlasCard, WebGL detection, geo pages, JSON-LD, metadata, sitemap, OG utilities, booking CTAs, source allow-list, offer pages and offer data, contact intro per source and project-type preselect, internal links resolving to pages, published claims including a value-independent price-literal ban, offer hero actions in every lead × booking state, the talk contact flow, canvas dimming and the marker on every offer page, and the Dependabot/CI/TypeScript-toolchain/security-override/Playwright config — 310 tests |
| E2E | Playwright | 41 tests across 5 spec files in `test/e2e/` covering contact form (honeypot, native constraint validation, happy path), scene-wiring sentinel assertions, site structure (Lab page, nav, footer, Manteca page, qualifying fields), the offer pages (every `OFFER_ROUTES` page without WebGL, tagged CTAs, keyboard focus, first screen at 375×667 and 375×560 per row, no sideways scroll at 320px, contact preselect, the talk contact flow, cross-links) and canvas dimming with WebGL on (SwiftShader, 1440×900 and 1920×1200). Two servers, both always started fresh: port 3178 with booking off (override with `E2E_PORT`) and 3179 with a fake Cal.com URL (`E2E_BOOKING_PORT`), where the `booking-on` project reruns the first-screen checks. Neither adopts an unrelated process. All green on the release 2 branch. Not run in CI — see TODOS.md |
| CI | GitHub Actions | `.github/workflows/ci.yml` — frozen-lockfile install, `pnpm audit`, lint (non-blocking), `pnpm run typecheck`, unit tests, production build on every PR |
| Supply chain | `pnpm audit` in CI | Advisory for humans, blocking for the Dependabot security PRs that auto-merge unattended. The blocking form is scoped to the exact set that merges without review and to the dependency class each can fix (`--prod` / `--dev`). `--ignore-unfixable` runs first to list advisories with no published fix, then a plain scoped audit does the blocking, so a fixable advisory the PR does not resolve holds it for a human. A held PR gets a `needs-review` label and a comment |
| Dependency updates | Dependabot | Daily. Security patches (patch/minor) auto-approve and squash-merge once CI passes; majors get a `needs-review` label |
| Deploy | Vercel | Automatic from GitHub push to main |

## Known Constraints

- Root layout wraps children in client boundary (SceneProvider) — prevents server component rendering for page content. Acceptable for v1 static portfolio.
- Mobile: SceneRouter mounts all scenes unconditionally; the mobile-only hero policy is deferred (see TODOS.md)
