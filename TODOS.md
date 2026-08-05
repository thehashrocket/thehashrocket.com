# TODOS

## Tech Debt Audit (2026-05-12)

### ~~[P1] Wire case study pages to `setCurrentScene`~~ ✓ COMPLETED
- **Completed:** v0.2.0.0 (2026-05-12) — `SceneSync` component added to `app/work/[slug]/page.tsx`; calls `setCurrentScene(slug)` on mount and `resetScene()` on unmount. Direct-URL navigation now loads the correct scene.

### ~~[P1] Fix Sentry org — currently pointing at `volunteerready`~~ ✓ RESOLVED
- **Resolution (2026-05-12):** `volunteerready` IS the correct Sentry org slug for this account. `project: "thehashrocket-org"` is also already correct. Config was fine. False alarm in original audit.

### ~~[P1] Name `MORPH_DURATION_MS` constant and fix AtlasCard navigation logic~~ ✓ COMPLETED
- **Completed:** v0.2.1.0 (2026-05-12) — `MORPH_DURATION_MS = 3000` extracted to `lib/constants.ts` (v0.2.0.0); `AtlasCard` navigation rewired to use `morphRunning` watcher + `navigatedRef` double-nav guard instead of raw `setTimeout` (v0.2.1.0). Scene `onMorphComplete` now drives the state machine.

### ~~[P2] Extract `usePrefersReducedMotion` and `useMediaQuery` hooks~~ ✓ COMPLETED
- **Completed:** v0.2.1.0 (2026-05-12) — Both hooks in `lib/hooks.ts`, reactive to system changes. All 5 scenes updated. 9 unit tests.

### ~~[P2] Pass `accent` color as prop to scenes instead of hardcoding~~ ✓ COMPLETED
- **Completed:** v0.2.1.0 (2026-05-12) — `SceneProps` extended with `accent?: string`; `SceneRouter` passes `caseStudies[slug].accent` to each scene.

### ~~[P2] Write foundational E2E tests~~ ✓ COMPLETED
- **Completed:** v0.2.1.0 (2026-05-12) — `playwright.config.ts` + `test:e2e` script added; 6 specs in `test/e2e/` covering contact form (honeypot, validation, happy path) and scene wiring (sentinel assertions).

### ~~[P2] Upgrade dev toolchain — Vitest 4, eslint 10, then TypeScript 6~~ PARTIALLY COMPLETE (PR4)
- **Completed (PR4, 2026-05-12):** Removed dead `@vitejs/plugin-react` devDep; upgraded `vitest` 3.2.4 → 4.0.18; upgraded `typescript` 5.9.3 → 6.0.3.
- **Remaining:** `eslint` 9.x → 10.x is **blocked** — `eslint-plugin-react@7.x` (transitive dep of `eslint-config-next@16.2.3`) uses `context.getFilename()` which was removed in ESLint 10. Cannot upgrade until `eslint-config-next` ships a version that bundles a compatible `eslint-plugin-react`.
- **Also found (PR4):** 12 pre-existing React Compiler lint errors in scene/hook source files (flagged by `eslint-plugin-react-compiler` via `eslint-config-next`). Not introduced by PR4. Should be fixed in a separate PR.
- **What:** Upgrade `eslint` 9.x → 10.x when unblocked
- **Why:** ESLint 10 standardizes flat config and removes legacy APIs; staying on 9.x is fine but gap grows over time.
- **Effort:** S (CC: ~15 min) | **Priority:** P2
- **Depends on:** `eslint-config-next` shipping with `eslint-plugin-react` ≥8 (which supports ESLint 10) — check on Next.js 16.x.y patch release notes
- **Checked (2026-05-14):** Bumped to Next 16.2.6; `eslint-config-next@16.2.6` still pins `eslint-plugin-react@^7.37.0`. Still blocked. Re-check on the next minor (16.3.x) or major (17.x) bump.
- **Checked (2026-08-05):** Bumped to Next 16.2.11; `eslint-config-next` still pinned at 16.2.3 and still on `eslint-plugin-react@7.37.5`. Still blocked.
- **Now blocks CI (2026-08-05):** v0.2.4.0 added `.github/workflows/ci.yml` with `pnpm run lint` set to `continue-on-error: true` specifically because of these 12 errors. A red lint would permanently block Dependabot auto-merge. Clear the 12 errors, then remove `continue-on-error` from the lint step.
- **Context:** PR4 (2026-05-12). Pre-existing lint errors need a separate cleanup PR before ESLint upgrade is worthwhile.

---

## CI & Supply Chain (2026-08-05)

### [P2] Machine-enforce that the lockfile stays free of known-vulnerable versions
- **What:** Add GitHub's `dependency-review-action` to `.github/workflows/ci.yml`.
- **Why:** v0.2.4.0 closed 35 alerts, but nothing enforces that they stay closed. A future lockfile refresh could reintroduce a vulnerable transitive version and CI would pass. `dependency-review-action` fails only on vulnerabilities a PR *introduces*, so unlike a blanket `pnpm audit` it won't deadlock auto-merge on an unrelated pre-existing advisory.
- **Effort:** S (CC: ~10 min) | **Priority:** P2
- **Context:** Raised by Codex adversarial review during the v0.2.4.0 ship. Rated Medium: "'35 alerts closed' is not machine-enforced and can silently regress on the next lockfile refresh."

### [P3] Run the Playwright suite in CI before auto-merging dependency bumps
- **What:** Add browser install + the 6 e2e specs to the `verify` job.
- **Why:** Auto-merge currently gates on typecheck, unit tests, and `next build`. A dependency bump that breaks only in a real browser (Server Actions, routing, image optimization) would merge undetected.
- **Effort:** S (CC: ~10 min) | **Priority:** P3
- **Risk:** E2E flake converts directly into security patches sitting unmerged, which is the failure this automation exists to prevent. Only worth adding if the suite proves stable.
- **Context:** Explicitly deferred by Jason during the v0.2.4.0 ship — reliability of the auto-merge gate was judged more important than breadth of coverage. Revisit if a bump ever slips through.

### ~~[P3] Fix `package.json` name~~ ✓ COMPLETED
- **Completed:** v0.2.1.0 (2026-05-12) — `"name"` changed from `"temp-scaffold"` to `"thehashrocket-com"`.

### ~~[P3] Clean up `next.config.ts` vestigial comment~~ ✓ COMPLETED
- **Completed:** v0.2.1.0 (2026-05-12) — Confirmed `componentCache` is not a real Next.js 16 option (not present in `node_modules/next/dist/`). The `experimental: {}` block was dead code; removed entirely.

---

## Deferred from Design Review (2026-04-21) — 3D Scenes

### Canvas Dimming for Case Study Pages
- **What:** Implement the docs/DESIGN.md spec that says the canvas "dims/freezes when text-heavy sections are in viewport." Currently no scene (PharmaScene or the three new scenes) implements this.
- **Why:** Bright 3D geometry competing with case study body text hurts readability. Dimming during reading sections lets the text breathe and honors the design system intent.
- **Effort:** S (CC: ~20 min) | **Priority:** P2
- **Depends on:** All 3 new scenes shipped (this PR)
- **Risk:** Requires a new Zustand field (e.g., `textInViewport: boolean`) or an IntersectionObserver in CaseStudyScroll, plus a dimming effect in each scene component (reduce ambientLight intensity or group opacity).
- **Context:** Deferred during design review (2026-04-21) to keep the 3D scenes PR focused. Apply to all 5 scenes together in a follow-up PR.

## Deferred from Eng Review (2026-04-13) — WebGL Crash Fix

### THREE.Clock Deprecation Warning
- **What:** THREE.js logs "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead." R3F v9 uses Clock internally.
- **Why:** Clock could be removed in a future three.js major, breaking 3D scenes. Currently cosmetic (console warning only).
- **Effort:** S (CC: ~15 min) | **Priority:** P3
- **Depends on:** @react-three/fiber releasing a version that uses THREE.Timer internally
- **Risk:** None currently. Only becomes a problem on a future three.js upgrade.
- **Context:** Spotted in Sentry breadcrumbs during WebGL crash investigation. The fix is upstream in R3F, not in our code. Check R3F changelog on next dependency update.

## Deferred from Design Review (2026-06-11)

### [Medium] Geo/locations pages lean on uniform bordered card lists
- **What:** `components/ui/geo/ServicesSection.tsx`, `components/ui/geo/CaseStudiesSection.tsx`, and `app/locations/page.tsx` use stacked bordered-card lists for marketing composition.
- **Why:** docs/DESIGN.md direction is editorial/asymmetric, cards only when the card IS the interaction. Uniform card lists read as template, not craft. [codex finding]
- **Effort:** M (CC: ~30 min) | **Priority:** P2 — needs a layout direction decision, not just CSS.

### [Medium] Mobile "hero only" 3D scene policy unenforced
- **What:** docs/DESIGN.md Responsive Tiers say mobile renders the hero scene only, but `SceneRouter` mounts case-study scenes on mobile too.
- **Why:** Mobile GPU/battery cost and spec drift. [codex finding]
- **Effort:** S (CC: ~20 min) | **Priority:** P2 — pairs well with the existing "Canvas Dimming" TODO above.

### [Medium] First-screen brand signal is soft
- **What:** Homepage first viewport identifies the person only via the small nav wordmark; the headline carries positioning but not identity.
- **Why:** Failed cross-model litmus "brand unmistakable in first screen." Brand/content decision (e.g., name/role lockup in hero eyebrow).
- **Effort:** S | **Priority:** P2

### [Medium] Pharma WMS has no screenshot asset
- **What:** `public/images/work/pharma-wms.png` doesn't exist; /work now shows an intentional typographic placeholder (FINDING-003, 2026-06-11).
- **Why:** A real product visual converts better than a placeholder. Content asset, can't be generated truthfully.
- **Effort:** content task | **Priority:** P2

### [Low] Print Portal cyan accent (#06b6d4) undocumented
- **What:** `lib/case-studies.ts` uses cyan for print-portal; docs/DESIGN.md case-study tints table only lists green/blue/amber.
- **Why:** Either document the cyan in docs/DESIGN.md or change the accent. Spec/docs drift.
- **Effort:** XS | **Priority:** P3

### [Low] Mobile nav lacks full modal semantics
- **What:** Escape-to-close + scroll lock shipped (FINDING-005); focus trap and background inerting still missing in `components/layout/MobileNav.tsx`.
- **Effort:** S | **Priority:** P3

### [Low] No mobile viewport E2E coverage
- **What:** `playwright.config.ts` runs Desktop Chrome only; mobile nav, hero fit, and small-screen layout are untested.
- **Effort:** S | **Priority:** P3

### [Polish] Heading scale / button padding drift
- **What:** Homepage H2 is 60px (scale says 48/64); button paddings vary py-2 / py-2.5 / py-3 across Nav, page CTAs, and geo CTASection.
- **Effort:** S token sweep | **Priority:** P3

## Geo Landing Pages

### Google Business Profile Setup
- **What:** Create and verify a Google Business Profile for thehashrocket.com targeting Central Valley service area (Sacramento, Stockton/San Joaquin County, Modesto/Stanislaus County)
- **Why:** GBP is the #1 local search ranking factor. Without it, geo pages rank in organic but don't appear in Google Maps / local pack.
- **Effort:** S (30 min setup + verification wait) | **Priority:** P1
- **Depends on:** Geo landing pages deployed and indexed
- **Risk:** Requires service area verification which can take 1-2 weeks. Manual process, not automatable.
- **Context:** Accepted as a documented post-deploy step during CEO plan review (2026-04-11). Set up immediately after geo pages go live. Add geo page URLs as website links in GBP.

### Expand Geo Pages to Northern California
- **What:** Add geo landing pages for additional Northern California cities (Fresno, San Jose, Oakland, etc.)
- **Why:** If initial 3 geo pages generate leads, each new city is a direct revenue multiplier with near-zero marginal cost.
- **Effort:** S per city (architecture in place) | **Priority:** P2
- **Depends on:** Geo v1 deployed + 3 months of Search Console data showing traction (organic traffic + at least 1 form fill from geo pages)
- **Risk:** Without traction data, expanding prematurely wastes research time on local economic context per city.
- **Context:** lib/locations.ts data-driven architecture makes adding cities trivial: add config entry, create OG image, write local context section. Gate on real data.

## Future Enhancements

### AI Chat Widget
- **What:** LLM-powered chat widget answering questions about experience, skills, availability
- **Why:** Instant 24/7 answers for potential clients. Differentiator.
- **Effort:** M (CC: ~30 min) | **Priority:** P3
- **Depends on:** Site launched, case study content finalized (LLM needs content to ground responses)
- **Risk:** Hallucination about experience/rates. Needs guardrails, content grounding, and testing before launch.
- **Context:** Deferred from expansion proposal #3 (2026-04-10). The core site must prove conversion before adding AI. Revisit after 1 month of traffic data.

### Sound Design
- **What:** Subtle ambient audio in 3D scenes (muted by default, toggle to enable)
- **Why:** Immersive experience for visitors who opt in
- **Effort:** S (CC: ~15 min) | **Priority:** P3
- **Depends on:** Phase 2 launched, audience feedback on the creative experience
- **Risk:** Polarizing. Many users dislike any audio on websites. Must be muted by default with clear toggle.
- **Context:** Deferred from expansion proposal #7 (2026-04-10). Add only if creative/agency audience feedback suggests it.

### CMS Integration (Phase 3)
- **What:** Migrate blog from MDX files to a headless CMS (Sanity, Contentful, or similar)
- **Why:** Better authoring experience if blog grows beyond ~10 posts or if non-dev collaborators need to publish
- **Effort:** M (CC: ~45 min) | **Priority:** P3
- **Depends on:** Blog launched, 10+ posts written, pain point validated
- **Risk:** Vendor lock-in, hosting cost, another dependency to maintain
- **Context:** MDX-in-repo is the right choice for v1 (simple, no dependencies). Revisit if content velocity demands it.

## Completed

### Motion `useScroll` dev warning on /work/[slug] pages (ISSUE-001 from /qa)
- **Completed:** 2026-05-14 — Added `html { position: relative }` to `app/globals.css`. Motion's `scroll()` defaults `container = document.scrollingElement` (`<html>`), and its dev-time check warns when that container is `position: static`. The fix was verified by cold-restarting the dev server (Turbopack CSS HMR did not pick up `<html>`-level rule changes during the initial QA pass — `pkill -f "next dev" && npm run dev` was required). Zero warnings post-restart across all 4 case study detail pages.

### 3D Scenes for Non-Pharma Case Studies
- **What:** Dedicated R3F canvas scenes for nonprofit-matching (graph nodes), grant-discovery (particle clusters), and print-portal (pipeline flow) case studies
- **Completed:** v0.1.5.0 (2026-04-21)
