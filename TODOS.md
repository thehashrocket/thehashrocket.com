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

### [P2] Upgrade dev toolchain — Vitest 4, eslint 10, then TypeScript 6
- **What:** Three major version bumps pending in dev dependencies: `vitest` 3.x → 4.x, `eslint` 9.x → 10.x, `typescript` 5.x → 6.x. Also `@vitejs/plugin-react` is two major versions behind (4.x → 6.x).
- **Why:** The further behind, the harder the eventual jump. TS 6 in particular introduces stricter checking that's easier to absorb incrementally.
- **Effort:** M (~half day, staggered) | **Priority:** P2
- **Depends on:** Do in order: Vitest 4 first (lowest risk) → eslint 10 → @vitejs/plugin-react → TS 6 last
- **Risk:** TS 6 may surface new type errors. Budget time to fix them, don't rush it.
- **Context:** Identified in tech debt audit (2026-05-12). Prod dependencies (Next, React, three.js, R3F) are current within their minor versions — no breaking changes pending there.

### [P3] Fix `package.json` name
- **What:** `"name": "temp-scaffold"` — leftover from project bootstrapping. Change to `"thehashrocket-com"`.
- **Why:** Cosmetic, but shows up in npm/build output and is embarrassing.
- **Effort:** XS (~2 min) | **Priority:** P3
- **Depends on:** Nothing
- **Risk:** None.
- **Context:** Identified in tech debt audit (2026-05-12).

### [P3] Clean up `next.config.ts` vestigial comment
- **What:** The `experimental: {}` block has a comment referencing `componentCache: false` for R3F compatibility, but the setting itself is not present. Either restore the setting with a link to the upstream issue, or remove the comment if the issue has been resolved.
- **Why:** Ambiguous — can't tell if this is a deliberate omission or an accidental drop.
- **Effort:** XS (~5 min) | **Priority:** P3
- **Depends on:** Verify whether pmndrs/react-three-fiber#3595 is still open/relevant on current R3F version
- **Risk:** None. If the issue is closed, delete the comment. If still open, restore the config line.
- **Context:** Identified in tech debt audit (2026-05-12).

---

## Deferred from Design Review (2026-04-21) — 3D Scenes

### Canvas Dimming for Case Study Pages
- **What:** Implement the DESIGN.md spec that says the canvas "dims/freezes when text-heavy sections are in viewport." Currently no scene (PharmaScene or the three new scenes) implements this.
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

### 3D Scenes for Non-Pharma Case Studies
- **What:** Dedicated R3F canvas scenes for nonprofit-matching (graph nodes), grant-discovery (particle clusters), and print-portal (pipeline flow) case studies
- **Completed:** v0.1.5.0 (2026-04-21)
