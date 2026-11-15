# Architecture — thehashrocket.com

## Overview

Consulting site for owner-operated and mid-size businesses, built with Next.js 16 (App Router), React 19, and React Three Fiber v9. The site uses a persistent 3D canvas overlaid with DOM content, scroll-driven scene transitions, and progressive WebGL enhancement.

## Component Tree

```
app/layout.tsx (Server Component — metadata, fonts, JSON-LD)
  ├── <Nav />                              (server — desktop links + client <MobileNav />; "Services" → /#services via NavAnchor)
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

**Contact form:** Server Action in `lib/actions.ts`. Honeypot spam protection + Upstash Redis rate limiting (fail-open if Redis unavailable). Email delivery via Resend: each inquiry goes to `CONTACT_EMAIL` (`jason@jasonshultz.com`, `lib/site.ts`) with the visitor's address as `replyTo`, from `RESEND_FROM_EMAIL` (set in Vercel) when it is one address on `mail.jasonshultz.com`, else the fallback `CONTACT_FROM_FALLBACK` (`contact@mail.jasonshultz.com`) with a logged warning (`contactFromAddress()` in `lib/contact-email.ts`). The sender must stay on `mail.jasonshultz.com`: jasonshultz.com publishes a strict DMARC record (`p=reject`, `adkim=s`, `aspf=s`) and the production Resend key only sends from that subdomain. Because the address becomes Reply-To, `isSingleEmailAddress()` accepts only an explicit set of characters, refusing lists, display names, comments, control characters and whitespace. `test/old-address-guard.test.ts` fails if `@thehashrocket.com` (any case) reappears in a text file under `app/`, `lib/`, `components/` or `public/`, or in a root-level config file (`next.config`, the `sentry.*.config` files, `instrumentation`, `instrumentation-client`, `proxy`, `middleware`, `vercel`). The old mailbox was retired on purpose (Nov 15). Source attribution tracks which page referred the lead; `source` is allow-listed in `lib/sources.ts`, then goes to the notification email and the Cal.com link. Nothing on the site stores it. A known offer-page source (`automation-sprint`, `ai-app-review`, `care-plan`, `print-shops`, `talks`) also preselects the form's project type through `projectTypeForSource` in `lib/contact-options.ts`; the visitor can still change it. The intro above the form comes from `contactIntro()` in `lib/contact-intro.ts`: the sprint, review, care-plan and talks sources name the page the visitor came from ("You came from the automation sprint page."), and talk sources (`talks`, `talk-attendee`) show no prices. The form's "What happens next" steps (right under the project-type select, in an `aria-live="polite"` region) and its timeline field follow the project type the visitor currently has selected (`contactFlowFor()` in `lib/contact-options.ts`): `FLOW_BY_PROJECT_TYPE` maps every option to the generic, sprint, review or talk flow, and "A talk for my group" shows the talk steps and no timeline. For the sprint, review and care-plan sources, `contactIntro()` returns the offer's price as separate `terms`, which the form shows only once the page has hydrated and only while that offer's type is selected (before hydration the browser may have restored a different type into the select). After a send, `submitContact` returns the allow-listed `submittedProjectType`; the confirmation names it and the steps follow it until the visitor's next input or change event (the form's own reset is not an edit), and the terms stay hidden beside that receipt. The select is uncontrolled; `onChange` and `onReset` mirror it into state, and a one-time read on mount picks up a value the browser restored or autofilled before hydration. After a successful send the fields clear but the select stays on the type that was sent, so a follow-up message keeps it. While a send is pending the text fields are read-only and the selects disabled, so nothing typed then is lost to that reset; read-only keeps keyboard focus in place and lets the visitor copy their message, and the "Still sending…" notice offers the same email and booking alternative as an error. The email subject (`contactSubject()` in `lib/contact-email.ts`) is `New contact from {name} - {projectType} (via {source})`, each part only when present. Three Upstash limiters are checked together with `getRemaining`, which reads without spending a slot: `contact:ip-day` (30 per day per IP), `contact:ip` (10 per hour per IP, sized for a talk room on shared venue Wi-Fi) and `contact:email` (3 per hour, keyed on a SHA-256 hash of the trimmed, lowercased address). The IP key is `x-real-ip`, falling back to the first `x-forwarded-for` entry. An exhausted limit returns "Too many submissions. Try again in N minutes" (in hours past an hour, from the denying limiter's `reset`; `tooManyMessage()` in `lib/contact-email.ts`) with `code: "rate_limited"`, and nothing is sent. Only after Resend accepts the email does `limit()` spend one slot on each limiter, so a failed send never counts (owner decision on #97). Because the check spends nothing, parallel requests could all pass it before any records, so a fourth limiter, `contact:burst` (10 per minute per IP), spends with `limit()` before the send: a parallel burst from one IP sends at most 10, and the hourly check refuses the rest once those record. A failed send costs a slot in that one-minute limiter only. A failed send, or one that has not answered in 10 seconds, returns "Your message wasn't sent…" with `code: "send_failed"`. Every error result also returns the visitor's `draft`, which the form uses as default values, so a plain POST before hydration keeps the draft too. For either code the form adds an email link (and a booking link through `BookingAnchor` with the page's source, when Cal.com is configured). The limiter name goes only to the server log. The limiters fail open: missing Upstash env vars skip them (with a warning on Vercel production), a setup failure skips them all, and a failed check (1 s timeout of our own, since `getRemaining` ignores the Ratelimit `timeout` option) skips only that limiter. A failed record after a successful send is logged and the visitor still sees success. The form submits through `onSubmit` + `startTransition` once hydrated, so a visitor keeps their draft on any error, and keeps `action` so a submit before hydration still posts to the server action. `TEST_EMAIL_ENABLED=true` skips the limiters and the email so e2e runs never spend Upstash quota, but only outside production: when `VERCEL_ENV` is `production` the flag is ignored.

**Canvas dimming:** `useDimCanvasBelow(ref, threshold)` in `lib/hooks.ts` sets `canvasDimmed` in the store once the element rises above `threshold` of the viewport, and `SceneCanvas` drops the whole canvas to 20% opacity. Doing it at the canvas covers every scene, and it stays dim below that point because the closing CTA sits on the canvas too. `CaseStudyScroll` uses it at 0.75; offer pages place `<DimCanvasBelow />` (0.5, so 1440×900 screens load bright) right after the hero. One dimming owner per page: both reset the flag on unmount, and `test/dim-canvas-below.test.tsx` fails on a page that renders both. A page that is all text (`/contact`) renders `<DimCanvas />` instead: a server-rendered `<span data-dim-canvas hidden>` that a CSS rule in `app/globals.css` (`body:has([data-dim-canvas]) .scene-canvas`) turns into the same 20% opacity, with no store involved, so the canvas mounts dim and another page's unmount cleanup cannot brighten it.

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
2. Copy `app/automation-sprint/page.tsx`: hero in the order `offer-scope` (`offerScope`), `offer-summary` (`offerSummary`), any buyer facts and the `offer-local` line (`heroFact`), then `<OfferHeroActions source=… spacing={offerActionsSpacing} />`, then `<DimCanvasBelow />` right after the hero section. Add an `opengraph-image.tsx` beside it.
3. Add the route to `OFFER_ROUTES` and a date to `OFFER_ROUTE_UPDATED` in `lib/site.ts` (the sitemap reads both), and a row to the `offerMetadata` record in `test/metadata.test.ts`.
4. Allow-list the source in `lib/sources.ts`, map it in `PROJECT_TYPE_BY_SOURCE` (`lib/contact-options.ts`) and give it a line in `contactIntro()` (`lib/contact-intro.ts`).
5. Add a `pages` row in `test/e2e/offer-pages.spec.ts` (`h1`, `fact`, `ctaText`, `firstScreen: 667 | 560 | false`); a test fails until every `OFFER_ROUTES` entry has one. `test/e2e/offer-dimming.spec.ts` and the Open Graph image check in `offer-pages.spec.ts` pick the route up on their own.
6. Run `pnpm run typecheck && pnpm test && pnpm run test:e2e`. Typecheck first: a missing metadata row is a compiler error there. For a trace, `pnpm exec playwright test --trace on <spec>`.

E2E runs two dev servers: port 3178 with booking off, and port 3179 with a fake Cal.com URL and its own build directory (`NEXT_DIST_DIR=.next-booking`, since Next 16 locks one dev server per directory). The `booking-on` project only runs the first-screen checks.

## Directory Structure

```
app/                    Routes (App Router)
  ├── page.tsx          Homepage (hero, proof strip, services, selected work, why me, how it works, CTA). Services (`serviceChoices`) is one priced card per `OFFER_ROUTES` page, prices from `lib/offers.ts`, paid offers first, laid out 6 / 3 / 3 then 6 / 6 on the 12-column lg grid; each card's accessible name is its name, price and call to action
  ├── opengraph-image.tsx  Homepage OG image (1200×630 via next/og)
  ├── about/            About page + opengraph-image.tsx
  ├── automation-sprint/ Fixed-price automation sprint offer + opengraph-image.tsx (Service AggregateOffer + FAQ JSON-LD)
  ├── ai-app-review/    Fixed-fee AI-built app review offer + opengraph-image.tsx (Service + FAQ JSON-LD)
  ├── care-plan/        Monthly care plan + opengraph-image.tsx (Service with a monthly UnitPriceSpecification + FAQ JSON-LD)
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
  ├── layout/           Shell components (Nav, MobileNav, NavAnchor, Footer, SceneProvider, ErrorBoundary, JsonLd, LocationJsonLd). NavAnchor renders in-page targets ("/#services") as plain anchors, since Next's Link uses pushState and fires no hashchange. On the target's own page it handles the click itself: history.pushState (which Next patches to copy its router state onto the entry, so Back and Forward still work), scrollIntoView, then a hashchange event for FocusOnHash. It also sets `data-nav-input` on `<html>` to `keyboard` or `pointer` (from the click's `detail`, via `lib/nav-input.ts`; a link to another page carries it across the full load in sessionStorage, and FocusOnHash restores it once on arrival), so the Services heading hides its outline for everyone and shows a thin underline only after keyboard activation. The fixed header's 95% background sits on an inner layer, never on the header itself: a filter or transform there would trap MobileNav's fixed overlay. `html` has `scroll-padding-top: 6rem` so focused links and fragment targets land below the header
  ├── scenes/           R3F scene components (HeroScene, PharmaScene, NonprofitScene, GrantScene, PrintPortalScene, ConsolidationScene, ModernizeScene, AuditScene, AutomationScene, VolunteerScene, SceneRouter). HeroScene fades each background dot to 0 while it sits over text in `<main>` and back to 0.5 once clear (instantly under reduced motion, which still stops the rotation), re-measuring the text every 0.2 s and at most every 50 ms during scroll or resize
  └── ui/               UI primitives (Button, Card, Input, ContactForm, AtlasCard, BookingLink, OfferHeroActions, DimCanvasBelow, DimCanvas, TrackedLink, ClosingCta, NumberedSteps, ArchitectureDiagram, LabSection, Timeline, SceneSync, FocusOnHash) and `styles.ts` (shared section class strings, including `heroFact` for buyer facts and the offer-hero classes). TrackedLink sends `offer_click { route, placement }` from homepage links into the offer pages; its optional `ariaLabel` gives a link that wraps a whole card a short accessible name. FocusOnHash moves keyboard focus to the homepage Services heading when the URL hash is #services
      └── geo/          Geo landing page sections (Hero, Services, CaseStudies, FAQ, CTA)
lib/
  ├── store.ts          Zustand scene state
  ├── actions.ts        Server Actions (contact form with TEST_EMAIL_ENABLED guard)
  ├── contact-options.ts  Contact form project types, timelines, and project type preselected by ?source=
  ├── constants.ts      Shared constants (MORPH_DURATION_MS, CONTACT_FORM_TIMEOUT_MS)
  ├── hooks.ts          Reusable hooks (usePrefersReducedMotion, useMediaQuery, useDimCanvasBelow)
  ├── nav-input.ts      Keyboard vs pointer nav-link activation, set as `data-nav-input` on `<html>` (sessionStorage carries it across a full page load)
  ├── case-studies.ts   Shared case study data (used by homepage, work, geo pages)
  ├── experience.ts     Career data (entries, core stack, domains — used by about, timeline)
  ├── offers.ts         Every offer number, the formatters (formatUsd, formatUsdRange, formatUsdCompact) and the pricing ladder (offerLadderParts/Text); type-only imports so client code may use it
  ├── offer-content.ts  Review, sprint, care-plan and talks page copy (server components only)
  ├── talk.ts           TALK_TITLE and the takeaways (leaf module; tests import the exact strings)
  ├── contact-intro.ts  /contact intro text per source
  ├── contact-email.ts  Contact email subject, the rate-limit wait message (tooManyMessage), the sender check (contactFromAddress, CONTACT_FROM_FALLBACK) and the one-address check (isSingleEmailAddress)
  ├── print-shops.ts    /print-shops copy (results and workflow come from the print-portal case study)
  ├── locations.ts      City configs (Sacramento, Stockton, Modesto, Manteca/Tracy/Lathrop) with optional localExperience
  ├── side-projects.ts  Side project data (used by /lab)
  ├── site.ts           Contact email, social URLs, booking and contact link helpers, `OFFER_ROUTES` (offer and talk pages: the sitemap, metadata, first-screen, Open Graph image and dimming checks iterate it) and `OFFER_ROUTE_UPDATED` (their sitemap dates)
  ├── sources.ts        ?source= allow-list
  ├── fonts.ts          next/font configuration (Space Grotesk, Inter, JetBrains Mono)
  ├── og-fonts.ts       Promise-based font loader for OG image generation (cached, retry-on-failure)
  ├── og-image.tsx      Shared OG image template component (1200×630, Space Grotesk/Inter)
  ├── scene-text-avoid.ts  HeroScene's dot fade over page text: readTextRects, isOverText, ndcToViewport, stepOpacity (no three.js, so jsdom tests cover them)
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
| Testing | Vitest + Testing Library | Unit tests for forms, store, hooks, scene sync, AtlasCard, WebGL detection, geo pages, JSON-LD, metadata, sitemap, OG utilities, booking CTAs, source allow-list, offer pages and offer data, contact intro per source and project-type preselect, internal links resolving to pages, published claims including a value-independent price-literal ban, offer hero actions in every lead × booking state, the talk contact flow, canvas dimming and the marker on every offer page, the contact limiter (three limits checked before send and recorded after success, a burst ceiling spent before send, fail-open per limiter), the contact form keeping drafts and offering an email/booking way through, the contact sender fallback, one-address check and visitor Reply-To, the old contact address staying out of shipped code, the nav and mobile menu, focus on the homepage Services section, `offer_click` events from `TrackedLink`, the homepage Services cards and the footer's offer links, the hero scene's dot fade over text (helpers and the frame loop), and the Dependabot/CI/TypeScript-toolchain/security-override/Playwright config — 418 tests in 50 files |
| E2E | Playwright | 67 tests across 5 spec files in `test/e2e/` covering contact form (honeypot, native constraint validation, happy path), scene-wiring sentinel assertions, site structure (Lab page, nav, footer, Manteca page, qualifying fields, Services from the desktop and mobile nav landing focused below the header, no outline box on the Services heading, the header hiding text scrolled under it, a link focused with Shift+Tab staying below the header, every mobile menu item reachable and 44px tall at 375×560), the homepage hero showing the sprint and the call at 1440×900 and 1280×720, the offer pages (every `OFFER_ROUTES` page without WebGL, tagged CTAs, keyboard focus, first screen at 375×667 and 375×560 per row, no sideways scroll at 320px, contact preselect, the talk contact flow, each route's Open Graph image, Tab reaching the /care-plan FAQ with a visible focus ring, cross-links) and canvas dimming with WebGL on (SwiftShader, 1440×900 and 1920×1200). Two servers, both always started fresh: port 3178 with booking off (override with `E2E_PORT`) and 3179 with a fake Cal.com URL (`E2E_BOOKING_PORT`), where the `booking-on` project reruns the first-screen checks. Neither adopts an unrelated process. All green on the release 2 branch. Not run in CI — see TODOS.md |
| CI | GitHub Actions | `.github/workflows/ci.yml` — frozen-lockfile install, `pnpm audit`, lint (non-blocking), `pnpm run typecheck`, unit tests, production build on every PR |
| Supply chain | `pnpm audit` in CI | Advisory for humans, blocking for the Dependabot security PRs that auto-merge unattended. The blocking form is scoped to the exact set that merges without review and to the dependency class each can fix (`--prod` / `--dev`). `--ignore-unfixable` runs first to list advisories with no published fix, then a plain scoped audit does the blocking, so a fixable advisory the PR does not resolve holds it for a human. A held PR gets a `needs-review` label and a comment |
| Dependency updates | Dependabot | Daily. Security patches (patch/minor) auto-approve and squash-merge once CI passes; majors get a `needs-review` label |
| Deploy | Vercel | Automatic from GitHub push to main |

## Known Constraints

- Root layout wraps children in client boundary (SceneProvider) — prevents server component rendering for page content. Acceptable for v1 static portfolio.
- Mobile: SceneRouter mounts all scenes unconditionally; the mobile-only hero policy is deferred (see TODOS.md)
