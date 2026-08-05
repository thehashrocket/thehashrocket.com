# Changelog

## [0.2.6.0] - 2026-08-05

### Added
- `pnpm run typecheck:fast` type checks the project with TypeScript 7, the native Go port — 0.52s against 2.72s for the same clean run, roughly 5x. TypeScript 7 is installed alongside the existing compiler as `typescript7`, an npm alias, so both are available at once.
- `pnpm run typecheck` runs the TypeScript 6 compiler and is the portable gate CI uses. It replaces the bare `tsc` invocation that CI called before.

### Changed
- `typescript` deliberately stays on 6.x. TypeScript 7 ships no JavaScript compiler API — `require("typescript")` resolves to a version stub — and no tsserver, so `@typescript-eslint/typescript-estree` crashes at module load reading `ts.ModuleKind.CommonJs` and `pnpm lint` exits 2 before linting a single file. No typescript-eslint release supports TypeScript 7 yet; the current stable and canary both cap their peer range below 6.1. Scoping a TypeScript 6 copy to just the ESLint chain via `pnpm.packageExtensions` does not work either — peer resolution still hands that subtree the root compiler. Next.js 16.2.12 does support TypeScript 7, but only behind `experimental.useTypeScriptCli`, which is not enough on its own while linting is dead.
- CI type checks with `pnpm run typecheck` instead of `pnpm exec tsc --noEmit`. Installing a second compiler under an alias also installs its `tsc` bin, and the alias wins `node_modules/.bin/tsc` — so a bare `tsc` anywhere in this repo silently runs 7.x rather than 6.x, with no error. Both scripts invoke a compiler by explicit path for that reason, and `test/typescript-toolchain.test.ts` fails loudly if a bare `tsc` is ever reintroduced or either version drifts.

### Fixed
- The failing contact form E2E test from 0.2.5.0 now passes. It asserted the server-side "Name must be at least 2 characters." message, which a real browser can never reach: `minLength={2}` on the name input means native constraint validation blocks submission and the server action never runs. The test now asserts the behavior that actually occurs — that the browser fires `invalid` on the name field and the form's `submit` event never fires — both tied causally to the click. Product behavior is unchanged; only the assertion was wrong. Whether a short name should also surface a visible inline message, rather than relying on the browser's native tooltip, is still an open design question.
- `package.json` and the `VERSION` file agree again. 0.2.5.0 moved `VERSION` to 0.2.5.0 but left `package.json` at 0.2.4.0, so the two release markers had been out of step since that merge. Nothing reads either value at runtime, so no behavior changed.

## [0.2.5.0] - 2026-08-05

### Changed
- All seven open Dependabot pull requests resolved in one consolidated upgrade. CI had verified each of them individually against `main`, but no job ever built the combination they would produce once merged in sequence — so the set was installed, typechecked, unit-tested, built, and run through Playwright together before landing.
- Production dependencies: `next` 16.2.11 → 16.2.12, `react` / `react-dom` 19.2.4 → 19.2.8, `@sentry/nextjs` 10.49.0 → 10.69.0, `three` 0.183.2 → 0.185.1, `motion` 12.38.0 → 12.43.0, `resend` 6.12.2 → 6.18.1, `@react-three/fiber` 9.6.0 → 9.7.0, `@upstash/redis` 1.37.0 → 1.38.1, `@next/third-parties` 16.2.4 → 16.2.12, `zustand` 5.0.12 → 5.0.14.
- Development dependencies: `vite` 7.3.6 → 8.2.0, `jsdom` 26.1.0 → 30.0.1, `@testing-library/jest-dom` 6.9.1 → 7.0.0, `@playwright/test` 1.59.1 → 1.62.1, `tailwindcss` / `@tailwindcss/postcss` 4.2.4 → 4.3.3, `eslint-config-next` 16.2.3 → 16.2.12, `vitest` 4.1.0 → 4.1.10, `happy-dom` 20.9.0 → 20.11.1.
- `@types/node` taken to ^24.13.3 rather than the ^26.1.2 Dependabot proposed. The runtime is pinned to 24.11 by `.nvmrc`, which is what both CI and Vercel build against; typing against Node 26 would let code compile against APIs that do not exist at runtime. The type major is kept in step with the runtime major deliberately.
- `@types/three` bumped 0.183.1 → 0.185.4 alongside `three` itself. Dependabot moved the runtime package but not its types, which drift together — the two were left one minor apart on `main`.
- `@testing-library/dom` added as an explicit dev dependency. `@testing-library/jest-dom` 7.0.0 promotes it to a required peer, and relying on it arriving transitively through `@testing-library/react` leaves resolution to chance.

### Fixed
- `vitest.config.ts` renamed to `vitest.config.mts`. Vite 8 warns that ESM syntax in a file loaded as CommonJS is unsupported by `configLoader: 'native'`, which becomes the default in a future major. The explicit ESM extension resolves it now rather than at the next breaking upgrade.
- `/test-results` and `/playwright-report` added to `.gitignore`. Playwright writes both on every local run and neither was ignored, so failure artifacts showed up as untracked files.

### For contributors
- PR #30 (vitest 4.0.18 → 4.1.0) was closed rather than merged. `main` reached 4.1.0 in 0.2.4.0, so the pull request proposed a version already shipped; it had been conflicting since.
- `test/e2e/contact-form.spec.ts` has one failing test, and it is not a regression from these upgrades. "contact form shows validation error for short name" asserts the server-side message from `lib/actions.ts`, but the name input carries `minLength={2}`, so the browser's native constraint validation blocks submission and the server action never runs. The `minLength` attribute has been present since the initial commit (#1) while the test arrived later in #22 — it has never been able to pass. E2E does not run in CI, which is why it went unnoticed. Left failing rather than papered over, since the fix is a product decision about whether validation should be enforced client-side, server-side, or both.
- The `pnpm lint` step remains non-blocking. The same 12 pre-existing `react-hooks` / react-compiler errors on `main` are still present and unchanged by this upgrade.

## [0.2.4.0] - 2026-08-05

### Security
- All 36 open Dependabot alerts closed — 2 critical, 20 high, 12 moderate, 2 low, across 12 packages. `pnpm audit` now reports no known vulnerabilities.
- `next` upgraded 16.2.6 → 16.2.11 — closes 10 alerts: Middleware/Proxy bypass in App Router with Turbopack and a single locale (GHSA-mgqv-mfjc-4hpr), three SSRF classes (rewrites with attacker-controlled destination hostname, Server Actions on custom servers, internal Server Function endpoint disclosure), cache confusion on requests with bodies including invalid UTF-8 sequences, and DoS in both Server Actions and the SVG path of the Image Optimization API.
- `vitest` upgraded 4.0.18 → 4.1.0 — closes a critical advisory where an exposed Vitest UI server allows arbitrary file read and execution.
- `vite` pinned as a direct dev dependency at ^7.3.6 — closes a `server.fs.deny` bypass on Windows alternate paths and NTLMv2 hash disclosure via UNC path handling in launch-editor. A `pnpm.overrides` entry alone would not move it off 7.3.3.
- Transitive dependencies with no direct upgrade path forced via `pnpm.overrides`: `@babel/core`, `@opentelemetry/core`, `brace-expansion` (both the 1.x and 5.x lines needed separate range selectors), `esbuild`, `fast-uri`, `js-yaml`, `postcss`, `sharp`, `uuid`, and `ws`. The `ws` advisories were found by `pnpm audit` and had no Dependabot alert filed yet.

### Fixed
- Dependabot version updates were silently disabled and had never run. `.github/dependabot.yml` declared `package-ecosystem: "pnpm"`, which is not a value GitHub recognizes — npm, yarn, and pnpm all use `"npm"`, and the package manager is inferred from the lockfile. An invalid value makes the whole file fail to parse, with no error surfaced anywhere. Only security updates were getting through, because those do not read the config file.
- Security advisories no longer queue behind one another. Dependabot keeps a single open pull request per group, so PR #30 (vitest, opened 2026-06-12) blocked every advisory filed after it for two months. Security updates are now split into separate production and development groups, so a stuck dev-dependency PR cannot hold back a production patch.

### Added
- Continuous integration. The repository previously had no CI at all. Every pull request now runs `pnpm install --frozen-lockfile`, typecheck, the unit suite, and a production build, matching how Vercel builds.
- Dependabot security patches are approved and squash-merged automatically once CI passes, so advisories stop waiting on a human. Scope is deliberately narrow: security groups only, patch and minor only. Major security bumps get a `needs-review` label and a comment instead of a merge.

### For contributors
- This project is pnpm-only, and `CLAUDE.md` now says so explicitly. Security pins for transitive dependencies live in `pnpm.overrides`, which npm ignores entirely — it only reads a top-level `overrides` key. Running `npm install` here resolves `postcss` to 8.4.31 and `sharp` to 0.34.5, both with open advisories. `conductor.json` and the Playwright web server command were still invoking npm and now use pnpm.
- New `test/dependabot-config.test.ts` (15 tests) locks down both the Dependabot config and the CI workflow. Both root causes of this incident were silent failures that surfaced no error, so a test is the only thing that catches a recurrence. Every assertion is mutation-verified.
- Auto-merge waits on the exact commit CI tested (`gh pr merge --match-head-commit`). Dependabot force-pushes rebases onto its own branches, so without it the verify job could pass on one commit while the squash landed another.
- Every GitHub Action is pinned to a full commit SHA rather than a mutable tag, since the auto-merge job runs with `contents: write` and no human in the loop. Dependabot keeps the SHAs current.

## [0.2.3.0] - 2026-06-11

### Changed
- Desktop nav links and the "Let's Talk" CTA now have a 44 px minimum touch target — taps land correctly without mis-firing adjacent links
- First image on the /work case study list is preloaded, improving Largest Contentful Paint on that page
- Placeholder typography card shown for case studies that don't yet have a screenshot asset

### Fixed
- `--text-muted` color token corrected to #808080 (was #737373, which failed WCAG AA contrast on the dark background)
- Contact form success and error messages are now announced to screen readers (`role="status"` / `role="alert"`)
- Mobile nav overlay now closes on Escape and prevents background page scroll while open; scroll state is restored correctly when the overlay closes
- Copy ellipsis changed from three periods to the proper `…` character throughout

### For contributors
- Timeout reference in contact form is now properly cancelled on component unmount (prevents state updates on unmounted components)
- Honeypot E2E test updated: confirms no success message appears when the honeypot field is filled (HTML5 validation correctly prevents the form from submitting)

## [0.2.2.1] - 2026-05-14

### Security
- `next` upgraded 16.2.3 → 16.2.6 — closes 13 Dependabot alerts: 7 high (Middleware/Proxy bypass — GHSA-26hh-7cqf-hhc6, -267c-6grr-h53f, -492v-c6pp-mqqv, -36qx-fr4f-26g5; SSRF via WebSocket upgrades — GHSA-c4j6-fc7j-m34r; DoS in Cache Components / Server Components — GHSA-mg66-mrh9-m8jx, -8h8q-6873-q5fj), 4 medium (XSS / DoS / cache poisoning — GHSA-ffhc-5mcf-pf4q, -gx5p-jg67-6x7h, -h64f-5h5j-jqjh, -wfc6-r584-vfw7), 2 low (cache poisoning — GHSA-3g8h-86w9-wvmq, -vfv6-92ff-j949)
- `postcss` forced ≥ 8.5.10 across the dependency tree via `pnpm.overrides` — closes GHSA-qx2v-qp2m-jg93 (XSS via unescaped `</style>` in CSS Stringify Output). Next 16.2.6 still hard-pins `postcss@8.4.31`; the override resolves it to `postcss@8.5.14`.

### For contributors
- Stale `package-lock.json` removed; `pnpm-lock.yaml` is the sole lockfile. `.github/dependabot.yml` already declared `package-ecosystem: "pnpm"`, but the unmanaged npm lockfile was generating fictional `postcss@8.5.9` alerts that didn't match the actual pnpm install. `package-lock.json` and `yarn.lock` added to `.gitignore` so they don't regenerate.
- `CLAUDE.md` GBrain Search Guidance section refreshed by `/sync-gbrain` — explains the new `.gbrain-source` worktree-pin convention (sibling Conductor worktrees each get their own scoped code index) and points to `gbrain autopilot --install` for background refresh.

## [0.2.2.0] - 2026-05-12

### For contributors
- Dead `@vitejs/plugin-react` devDependency removed — it was never imported by `vitest.config.ts` or any source file
- `vitest` upgraded 3.2.4 → 4.0.18 (exact pin — `^` removed to prevent Dependabot from auto-upgrading to 4.1.x, which requires Vite ≥6)
- `typescript` upgraded 5.9.3 → 6.0.3
- Test mock fixed for Vitest 4: `Resend` constructor mock converted from arrow function to `function` keyword (Vitest 4 tightened constructor semantics); duplicate `vi.mock("resend")` removed from test body (was being hoisted and overriding the top-level fix)
- `IntersectionObserver` mock in `test/timeline.test.tsx` updated with `readonly scrollMargin = ""` to satisfy TypeScript 6's updated DOM interface
- ESLint 10 upgrade deferred: `eslint-plugin-react@7.x` (transitive via `eslint-config-next@16.2.3`) uses `context.getFilename()` removed in ESLint 10; blocked until `eslint-config-next` ships a compatible version

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
