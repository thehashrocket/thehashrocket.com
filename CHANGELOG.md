# Changelog

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
