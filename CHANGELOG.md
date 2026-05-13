# Changelog

## [0.2.1.0] - 2026-05-12

### Changed
- Reactive `usePrefersReducedMotion` and `useMediaQuery` hooks replace stale `useMemo` snapshots — 3D scene animations now respond to system preference and viewport changes without a page reload
- `AtlasCard` navigation rewired: `setTimeout`-based `completeMorph` replaced with a `morphRunning` watcher and `navigatedRef` double-navigation guard, eliminating spurious double-pushes on rapid clicks
- `onMorphComplete` callback threaded through `SceneRouter` conditionally — passed only when `morphRunning` is true, so direct-URL loads no longer fire stray morph timers
- `SceneSync` renders an sr-only DOM sentinel (`data-testid="current-scene"`) enabling WebGL-free E2E test assertions on active scene state
- All five case study scenes accept `accent` and `onMorphComplete` props; accent colors extracted from constants instead of hardcoded strings

### Added
- `lib/hooks.ts` — `usePrefersReducedMotion` and `useMediaQuery` as standalone, reusable hooks
- Playwright E2E foundation: `playwright.config.ts`, `test:e2e` script, 6 specs covering contact form honeypot/validation/happy-path and scene-wiring sentinel assertions
- `TEST_EMAIL_ENABLED` env guard in `lib/actions.ts` — prevents Resend API calls in test environments; `playwright.config.ts` passes the flag to the dev server automatically
- 15 new unit tests: hooks (9), AtlasCard navigation including double-nav guard (5), updated scene-sync sentinel assertion (1)

### For contributors
- `package.json` name corrected from `temp-scaffold` to `thehashrocket-com`
- Dead `experimental: {}` block removed from `next.config.ts` (`componentCache` is not a real Next.js 16 option)
- `jsdom` pinned to `^26` in devDependencies — v27 introduced an ESM-only transitive dependency (`@exodus/bytes`) that breaks the vitest CJS environment
- TS2352 double-cast fix in `test/case-studies.test.ts` (`as unknown as Record<string, unknown>`)

## [0.2.0.0] - 2026-04-22

### Added
- OpenGraph images on all six pages (`/`, `/work`, `/about`, `/contact`, `/work/[slug]`, `/locations`) using `next/og` — each generates a 1200×630 PNG with the site's Space Grotesk/Inter type system
- JSON-LD structured data across the site: `PersonJsonLd` and `WebSiteJsonLd` in the root layout, `BreadcrumbListJsonLd` on case study pages, `LocationJsonLd` and `FAQJsonLd` on location pages
- `generateMetadata` on the location page for per-city `og:title`, `og:description`, and canonical URL
- `openGraph.url` on home, work, about, contact, and location pages
- Location slugs added to the sitemap with `priority: 0.8`
- Font-loading utility (`lib/og-fonts.ts`) with Promise-based cache and retry-on-failure semantics
- OG image template component (`lib/og-image.tsx`) shared across all routes
- 5 new test files covering JSON-LD rendering, metadata exports, sitemap structure, and location page metadata generation — 98 tests total

### Fixed
- Import ordering in `app/page.tsx`
- `openGraph.url` added to location `generateMetadata` for consistency with other pages

## [0.1.5.1] - 2026-04-21

### Added
- Case study images on the /work page for Pharma WMS, Nonprofit Matching, and Grant Discovery — replacing the colored placeholder blocks

## [0.1.5.0] - 2026-04-21

### Added
- 3D canvas scenes for all three non-pharma case studies: graph nodes for Nonprofit Matching, particle clusters for Grant Discovery, pipeline flow for Print Portal
- `NonprofitScene` — progressive graph edge reveal driven by scroll progress (blue accent, 15 nodes, 27 edges)
- `GrantScene` — 100 particles scatter to 5 clusters via eased lerp as scroll increases (amber accent, GPU-efficient with `needsUpdate` only on progress change)
- `PrintPortalScene` — 4 job quads flowing through Prepress → Press → Bindery → Shipping stations with 0.25 phase offsets (cyan accent)
- `prefers-reduced-motion` guard in all five scenes (HeroScene, PharmaScene, and all three new scenes)
- Mobile freeze in all three new scenes — geometry visible, no animation on viewports < 768px

### Fixed
- `HeroScene` used `<mesh>` as a group container for orbiting particles — changed to `<group>` (correct R3F primitive)
- `GrantScene` stale `prevProgress` ref now resets to -1 on deactivation, preventing frozen particles on re-entry at the same scroll position

## [0.1.4.1] - 2026-04-14

### Changed
- Switched Vercel Analytics import from `@vercel/analytics/react` to `@vercel/analytics/next` for automatic Next.js route change tracking

## [0.1.4.0] - 2026-04-13

### Fixed
- WebGL context crash on devices without a GPU (bots, crawlers, headless browsers, old hardware) — `isWebGLSupported()` now caches its result and gates Canvas mounting
- Hydration mismatch in SceneCanvas — WebGL detection deferred to `useEffect` so server and client render the same fallback initially

## [0.1.3.0] - 2026-04-13

### Added
- Career timeline on the About page with progressive disclosure (expanded/compact/condensed tiers), scroll-reveal animations, and responsive mobile layout
- Career data layer (`lib/experience.ts`) with typed entries, skills taxonomy, and domain tags
- Stack & Domains section on the homepage showing tech tags and domain expertise
- Local experience blocks on geo landing pages (Sacramento, Stockton, Modesto) connecting career history to regional credibility
- Data-driven Core Stack and Domains lists on the About page, replacing hardcoded content
- Full test coverage for career data validation and Timeline component rendering

### Changed
- Updated experience claim from "25 years" to "14 years" across all 11 files (layout metadata, JSON-LD, hero, about, footer, geo pages, docs)
- Rewrote About page bio paragraphs with specific domain references from career history
- Work page now imports case study data from `lib/case-studies.ts` instead of duplicating it inline

### Fixed
- Timeline tier logic now handles small entry lists correctly (4 or fewer entries all get full detail)
- Animation delay capped at 400ms to prevent long waits with many entries
- Mobile responsive behavior wired up via `useIsMobile` hook (was previously hardcoded to desktop)

## [0.1.2.2] - 2026-04-13

### Added
- Google Analytics (gtag.js) via `@next/third-parties/google`, gated behind `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var so dev/preview environments stay clean

### Fixed
- FAQ accordion tests updated to match native `details/summary` implementation (pre-existing test breakage from v0.1.2.0)

## [0.1.2.1] - 2026-04-12

### Fixed
- Contact form now correctly detects Resend API failures instead of silently reporting success
- Added error logging for both Resend API errors and unexpected exceptions
- Resend client is now a lazy singleton, avoiding unnecessary instantiation on every request
- Test mocks updated to match the actual Resend SDK `{ data, error }` response shape

## [0.1.2.0] - 2026-04-11

### Changed
- FAQ sections on geo landing pages now use native `<details>/<summary>` accordion instead of static Q&A display — click or keyboard (Enter/Space) to expand/collapse each question
- Restored `<h3>` heading semantics inside accordion summaries for screen readers and SEO document outline
- Added `aria-hidden` on accordion indicator icon to clean up screen reader announcements
- Cross-browser marker suppression for Firefox compatibility

## [0.1.1.0] - 2026-04-11

### Added
- Geo-targeted landing pages for Sacramento, Stockton, and Modesto with city-specific hero copy, industry framing, and local economic context
- Hub page at /locations with staggered layout linking to all 3 cities
- ProfessionalService and FAQPage JSON-LD structured data on each geo page
- Dynamic OG images per city using next/og with committed font files
- Sitemap entries for /locations hub and all geo pages
- Contact form source attribution from geo pages (query param tracks which city page referred the lead)
- "Locations" link in main navigation
- Case study data extracted to shared lib/case-studies.ts (DRY, used by homepage, work pages, and geo pages)
- Per-city case study connectors tying projects to local context
- Trust proof strip in geo page hero (25+ YRS, $10K+, industries, 1:1 direct)
- Breadcrumb navigation on each geo page
- Nearby locations footer linking to sibling cities
- Internal linking from /work/[slug] case study pages to geo pages
- @vercel/analytics integration for page-level tracking
- "Book a scoping call" CTA (Cal.com) alongside contact form CTA
- 3 new test files (20 tests) covering location data, case study data, and geo page integration

## [0.1.0.2] - 2026-04-10

### Added
- Conductor workspace configuration (`conductor.json`) with setup, run, and archive scripts for automated dev environment management

## [0.1.0.1] - 2026-04-10

### Added
- AI agent documentation: `docs/ARCHITECTURE.md` (system architecture, component tree, data flow) and `docs/DOMAIN.md` (business context, brand identity)
- CLAUDE.md enriched with Architecture & Context, Testing, and Conventions sections

### Changed
- Moved `DESIGN.md` to `docs/DESIGN.md` (preserves git history via `git mv`)
- Updated all DESIGN.md references in CLAUDE.md, `app/page.tsx`, and `app/work/page.tsx`

## [0.1.0.0] - 2026-04-10

### Added
- Creative portfolio site with Next.js 16, React 19, and React Three Fiber v9
- Interactive 3D hero scene with wireframe icosahedron and orbiting particles
- Systems atlas homepage with problem-framed case study cards and morph navigation
- Three case study pages (pharma WMS, nonprofit matching, grant discovery) with scroll-driven narratives
- Contact form with Server Actions, honeypot spam protection, and Upstash rate limiting (fail-open)
- Responsive navigation with mobile hamburger menu
- SceneProvider architecture: persistent R3F canvas with lazy-loading and static fallback
- WebGL progressive enhancement with Error Boundary fallback
- JSON-LD structured data (Person + WebSite schemas)
- SEO metadata, robots.txt, and sitemap generation
- Design system with dark theme, WCAG AA contrast-verified color tokens
- Vitest test suite: 16 tests covering contact form, scene store, and WebGL detection
