# TODOS

## Deferred from CEO Plan Review (2026-04-11) — Geo Landing Pages

### Google Business Profile Setup
- **What:** Create and verify a Google Business Profile for thehashrocket.com targeting Central Valley service area (Sacramento, Stockton/San Joaquin County, Modesto/Stanislaus County)
- **Why:** GBP is the #1 local search ranking factor. Without it, geo pages rank in organic but don't appear in Google Maps / local pack.
- **Effort:** S (30 min setup + verification wait) | **Priority:** P1
- **Depends on:** Geo landing pages deployed and indexed
- **Risk:** Requires service area verification which can take 1-2 weeks. Manual process, not automatable.
- **Context:** Accepted as a documented post-deploy step during CEO plan review. Set up immediately after geo pages go live. Add geo page URLs as website links in GBP.

### Expand Geo Pages to Northern California
- **What:** Add geo landing pages for additional Northern California cities (Fresno, San Jose, Oakland, etc.)
- **Why:** If initial 3 geo pages generate leads, each new city is a direct revenue multiplier with near-zero marginal cost.
- **Effort:** S per city (architecture in place) | **Priority:** P2
- **Depends on:** Geo v1 deployed + 3 months of Search Console data showing traction (organic traffic + at least 1 form fill from geo pages)
- **Risk:** Without traction data, expanding prematurely wastes research time on local economic context per city.
- **Context:** lib/locations.ts data-driven architecture makes adding cities trivial: add config entry, create OG image, write local context section. Gate on real data.

## Deferred from CEO Plan Review (2026-04-10)

### AI Chat Widget
- **What:** LLM-powered chat widget answering questions about experience, skills, availability
- **Why:** Instant 24/7 answers for potential clients. Differentiator.
- **Effort:** M (CC: ~30 min) | **Priority:** P3
- **Depends on:** Site launched, case study content finalized (LLM needs content to ground responses)
- **Risk:** Hallucination about experience/rates. Needs guardrails, content grounding, and testing before launch.
- **Context:** Deferred from expansion proposal #3. The core site must prove conversion before adding AI. Revisit after 1 month of traffic data.

### Sound Design
- **What:** Subtle ambient audio in 3D scenes (muted by default, toggle to enable)
- **Why:** Immersive experience for visitors who opt in
- **Effort:** S (CC: ~15 min) | **Priority:** P3
- **Depends on:** Phase 2 launched, audience feedback on the creative experience
- **Risk:** Polarizing. Many users dislike any audio on websites. Must be muted by default with clear toggle.
- **Context:** Deferred from expansion proposal #7. Add only if creative/agency audience feedback suggests it.

### CMS Integration (Phase 3)
- **What:** Migrate blog from MDX files to a headless CMS (Sanity, Contentful, or similar)
- **Why:** Better authoring experience if blog grows beyond ~10 posts or if non-dev collaborators need to publish
- **Effort:** M (CC: ~45 min) | **Priority:** P3
- **Depends on:** Blog launched, 10+ posts written, pain point validated
- **Risk:** Vendor lock-in, hosting cost, another dependency to maintain
- **Context:** MDX-in-repo is the right choice for v1 (simple, no dependencies). Revisit if content velocity demands it.
