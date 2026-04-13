# Architecture — thehashrocket.com

## Overview

Creative developer portfolio built with Next.js 16 (App Router), React 19, and React Three Fiber v9. The site uses a persistent 3D canvas overlaid with DOM content, scroll-driven scene transitions, and progressive WebGL enhancement.

## Component Tree

```
app/layout.tsx (Server Component — metadata, fonts, JSON-LD)
  ├── <Nav />                         (client — responsive nav + mobile hamburger)
  ├── <SceneProvider />               (client — persistent 3D canvas wrapper)
  │   ├── <ErrorBoundary>             (catches WebGL failures)
  │   │   └── <SceneCanvas />         (lazy-loaded via next/dynamic, ssr: false)
  │   │       └── <SceneRouter />     (reads Zustand store, renders active scene)
  │   │           ├── <HeroScene />   (wireframe icosahedron + particles)
  │   │           └── <PharmaScene /> (warehouse conveyor visualization)
  │   └── {children}                  (page content, overlaid on canvas)
  └── <Footer />
```

## Key Architectural Decisions

**Persistent canvas:** The R3F `<Canvas>` lives in the root layout, always mounted. Individual pages dispatch scene changes to a Zustand store rather than mounting their own canvases. This avoids WebGL context creation/destruction on navigation.

**Lazy-loaded three.js:** three.js is ~150KB gzip. `SceneCanvas` is loaded via `next/dynamic` with `ssr: false`. A static fallback image serves as both the loading state and the LCP element.

**Zustand scene state:** `lib/store.ts` manages `currentScene`, `scrollProgress`, and `morphRunning`. Pages set the scene; the canvas reads it. No prop drilling through the component tree.

**Progressive enhancement:** `lib/webgl.ts` detects WebGL support. If unavailable, `ErrorBoundary` catches the failure and renders `StaticFallback`. The site is fully functional without WebGL.

**Contact form:** Server Action in `lib/actions.ts`. Honeypot spam protection + Upstash Redis rate limiting (fail-open if Redis unavailable). Email delivery via Resend. Source attribution tracks which page referred the lead.

**Geo landing pages:** Data-driven architecture via `lib/locations.ts`. Each city gets a statically generated page at `/locations/[slug]` with `dynamicParams = false`. Adding a new city is config-only: add an entry to `lib/locations.ts` and it automatically gets a page, OG image, sitemap entry, and JSON-LD structured data. Cities with `localExperience` get a career credibility block in the "Why local?" card.

**Career data:** `lib/experience.ts` holds typed career entries, skills taxonomy, and domain tags. Consumed by the About page (timeline + skills lists), homepage (tech tags + domains), and validated against `lib/locations.ts` slugs. The `Timeline` component uses progressive disclosure (expanded/compact/condensed tiers) with responsive behavior and scroll-reveal animations.

## Data Flow

```
User scrolls page
  → GSAP ScrollTrigger fires
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
  ├── page.tsx          Homepage (hero + systems atlas + CTA)
  ├── about/            About page
  ├── contact/          Contact form
  ├── work/             Case studies index
  │   └── [slug]/       Individual case study
  ├── locations/        Geo landing pages hub
  │   └── [slug]/       City page + opengraph-image.tsx
  ├── layout.tsx        Root layout (canvas + nav + footer + analytics)
  └── not-found.tsx     404 with persistent canvas
components/
  ├── layout/           Shell components (Nav, Footer, SceneProvider, ErrorBoundary)
  ├── scenes/           R3F scene components (HeroScene, PharmaScene, SceneRouter)
  └── ui/               UI primitives (Button, Card, Input, ContactForm, AtlasCard, Timeline)
      └── geo/          Geo landing page sections (Hero, Services, CaseStudies, FAQ, CTA)
lib/
  ├── store.ts          Zustand scene state
  ├── actions.ts        Server Actions (contact form with source attribution)
  ├── case-studies.ts   Shared case study data (used by homepage, work, geo pages)
  ├── experience.ts     Career data (entries, skills, domains — used by about, homepage, timeline)
  ├── locations.ts      City configs (Sacramento, Stockton, Modesto) with optional localExperience
  ├── fonts.ts          next/font configuration (Space Grotesk, Inter, JetBrains Mono)
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
| Testing | Vitest + Testing Library | Unit tests for forms, store, WebGL detection, geo pages |
| E2E | Playwright | Browser testing (configured, not yet populated) |
| Deploy | Vercel | Automatic from GitHub push to main |

## Known Constraints

- `componentCache: false` required in `next.config.ts` due to R3F compatibility issue (pmndrs/react-three-fiber#3595)
- Root layout wraps children in client boundary (SceneProvider) — prevents server component rendering for page content. Acceptable for v1 static portfolio.
- Mobile: only hero scene renders, other pages show canvas in idle/frozen state
