# Design System — thehashrocket.com

## Product Context
- **What this is:** Creative developer portfolio with immersive 3D elements, converting potential clients into consulting leads
- **Who it's for:** Potential clients looking to hire a senior full-stack engineer for complex systems
- **Space/industry:** Creative developer portfolios (references: itssharl.ee, dunks1980.com, tamalsen.dev, cydstumpel.nl)
- **Project type:** Marketing/portfolio site with R3F 3D scenes, scroll-driven narratives, and interactive experiments

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian meets Luxury/Refined
- **Decoration level:** Intentional — 3D scenes ARE the decoration, DOM surfaces stay clean
- **Mood:** Dark, precise, technical craft. Like a well-designed terminal or a high-end engineering tool. The site itself proves the engineer can build anything.
- **Reference sites:** itssharl.ee, dunks1980.com, tamalsen.dev, cydstumpel.nl

## Typography
- **Display/Headings:** Space Grotesk — geometric sans with a technical feel, strong at large sizes, tight letter-spacing (-0.02em)
- **Body:** Inter — highly readable at all sizes, pairs cleanly with Space Grotesk
- **UI/Labels:** Inter (same as body)
- **Data/Tables:** JetBrains Mono — supports tabular-nums, clear at small sizes
- **Code:** JetBrains Mono
- **Loading:** `next/font/google` (self-hosted, zero layout shift)
- **Scale:**
  - 96px — hero display (Space Grotesk 700, -0.03em, line-height 1.05)
  - 64px — page title (Space Grotesk 700, -0.02em, line-height 1.05)
  - 48px — section heading (Space Grotesk 700, -0.02em, line-height 1.1)
  - 32px — subsection (Space Grotesk 600, -0.02em, line-height 1.15)
  - 24px — card title (Space Grotesk 600, -0.01em, line-height 1.2)
  - 20px — body large (Inter 400, line-height 1.4)
  - 16px — body default (Inter 400, line-height 1.6)
  - 14px — small/captions (Inter 400, line-height 1.5)

## Color
- **Approach:** Restrained — monochrome + single global accent (#4ade80 green), color is rare and meaningful. Case study accent tints (blue, amber) are scoped overrides used only within their respective case study pages, not as global UI accents.
- **CSS custom properties (define in `:root`, Tailwind consumes them):**

### Dark Theme (default)
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | #0a0a0a | Page background |
| `--surface` | #141414 | Cards, panels, elevated surfaces |
| `--surface-hover` | #1a1a1a | Hover state for surfaces |
| `--border` | #262626 | Borders, dividers |
| `--text-primary` | #fafafa | Headings, primary text |
| `--text-secondary` | #a1a1a1 | Body text, descriptions |
| `--text-muted` | #808080 | Labels, captions, metadata (5.01:1 on --bg) |
| `--accent` | #4ade80 | Primary accent (green, terminal feel) |
| `--accent-hover` | #22c55e | Accent hover state |
| `--accent-subtle` | rgba(74,222,128,0.1) | Accent backgrounds, tags |

### Light Theme (Phase 2)
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | #fafafa | Page background |
| `--surface` | #ffffff | Cards, panels |
| `--surface-hover` | #f5f5f5 | Hover state |
| `--border` | #e5e5e5 | Borders, dividers |
| `--text-primary` | #0a0a0a | Headings, primary text |
| `--text-secondary` | #525252 | Body text |
| `--text-muted` | #767676 | Labels, captions (4.54:1 on --bg) |
| `--accent` | #15803d | Accent (darker green for AA contrast, 4.81:1) |
| `--accent-hover` | #166534 | Accent hover (6.83:1) |
| `--accent-subtle` | rgba(22,163,74,0.08) | Accent backgrounds |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | #4ade80 | Success states, confirmations |
| `--warning` | #fbbf24 | Warnings, caution states |
| `--error` | #f87171 | Errors, destructive actions |
| `--info` | #60a5fa | Informational states |

### Case Study Accent Tints
| Project | Hex | Usage |
|---------|-----|-------|
| Pharma WMS | #4ade80 (green) | Accent bar, 3D scene highlights |
| Nonprofit Matching | #3b82f6 (blue) | Accent bar, node connections |
| Grant Discovery | #f59e0b (amber) | Accent bar, matched particles |

## Spacing
- **Base unit:** 4px (Tailwind default scale)
- **Density:** Comfortable
- **Scale:**
  - `2xs`: 2px
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 16px
  - `lg`: 24px
  - `xl`: 32px
  - `2xl`: 48px
  - `3xl`: 64px
  - `4xl`: 96px
- **Section padding:** 96px desktop, 64px tablet, 48px mobile
- **Content max-width:** 720px for body text, 1280px for full-width layouts
- **Note:** Spacing scale names map to Tailwind utilities (e.g., `lg` = `p-6`). In component patterns, `--space-lg` means 24px / Tailwind `p-6`. Define as CSS custom properties if consuming outside Tailwind.

## Layout
- **Approach:** Creative-editorial — asymmetric grids, staggered sections, no uniform card grids
- **Grid:** 12 columns desktop, 8 columns tablet, 1 column mobile (see Responsive Tiers)
- **Max content width:** 1280px
- **Border radius** (referenced as `--radius-*` in component patterns, define as CSS custom properties):
  - `--radius-sm`: 4px — inputs, small elements
  - `--radius-md`: 8px — cards, containers
  - `--radius-lg`: 16px — modals, featured sections
  - `--radius-full`: 9999px — pills, avatars, badges
- **Anti-slop rules:**
  - No 3-column feature grids
  - No centered-everything layouts
  - Left-aligned text default, asymmetric compositions
  - Atlas: 3 problem sections staggered vertically with different sizes
  - Lab: masonry or staggered grid with varying card dimensions
  - Work page: full-width case study previews, alternating image/text sides

## Motion
- **Approach:** Intentional — 3 defined roles, everything else cut
- **Roles:**
  1. Hero atmosphere (R3F useFrame, continuous)
  2. Case study narrative transitions (Motion scroll-linked)
  3. Subtle scroll reveals (Motion, text/image entrance)
- **Priority:** Atlas morph > Motion route transition > Motion scroll > R3F in-scene
- **Canvas behavior:** Dims/freezes when text-heavy sections are in viewport
- **Page transitions:** Enter-only for Phase 1. No AnimatePresence exit animations (unreliable with App Router).
- **Mobile canvas:** Always mounted, idle/frozen on non-hero pages. Only the hero scene renders on mobile (see Responsive Tiers: "Hero only"). No conditional mount/unmount.
- **Easing:**
  - Enter: `cubic-bezier(0, 0, 0.2, 1)` (ease-out)
  - Exit: `cubic-bezier(0.4, 0, 1, 1)` (ease-in) — Phase 2, not used in Phase 1 (no exit animations)
  - Move: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- **Duration:**
  - Micro: 100ms (button hover, toggle)
  - Short: 200ms (fade in, small reveals)
  - Medium: 350ms (section entrance, scroll reveals)
  - Long: 600ms (route transitions, 3D morphs)
- **`prefers-reduced-motion`:** All animation disabled, static fallbacks

## Component Patterns

### Buttons
- **Primary:** `--accent` bg, `#0a0a0a` text, `--radius-sm`, Space Grotesk 600
- **Secondary:** `--surface` bg, `--border` border, `--text-primary` text
- **Ghost:** transparent bg, `--accent` text, no border
- **Hover:** Primary darkens to `--accent-hover`, Secondary border becomes `--accent`
- **Min touch target:** 44px height

### Inputs
- **Background:** `--surface`
- **Border:** `--border`, focus = `--accent`
- **Text:** `--text-primary`, placeholder = `--text-muted`
- **Radius:** `--radius-sm`
- **Font:** Inter 14px

### Cards
- **Background:** `--surface`, border `--border`
- **Hover:** border becomes `--accent`
- **Radius:** `--radius-md`
- **Padding:** `--space-lg` (24px)

### Alerts
- **Pattern:** 10% opacity accent bg + 20% opacity accent border + full accent text
- **Success:** green, **Warning:** amber, **Error:** red, **Info:** blue

### Tags/Badges
- **Background:** `--accent-subtle`
- **Text:** `--accent`
- **Radius:** `--radius-full`
- **Font:** JetBrains Mono 12px

## Responsive Tiers

| Tier | Breakpoint | Grid | Nav | 3D | Motion |
|------|------------|------|-----|-----|--------|
| Desktop | 1024px+ | 12-col | Full top nav | Full scenes | All 3 roles |
| Tablet | 768-1023px | 8-col | Full top nav | Simplified | Reduced |
| Mobile | < 768px | 1-col | Hamburger + overlay | Hero only | Minimal |

## Accessibility
- Contrast: 4.5:1 body text, 3:1 large text (#fafafa on #0a0a0a = 18.97:1)
- Touch targets: 44px minimum
- Canvas: `aria-hidden` (decorative), all content in DOM
- ARIA landmarks: `banner`, `main`, `contentinfo`
- Skip links, focus management on route change
- `prefers-reduced-motion`: all animation disabled

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-10 | Initial design system | Created by /design-consultation, grounded in /plan-design-review decisions and competitive research of 4 reference sites |
| 2026-04-10 | Space Grotesk + Inter + JetBrains Mono | Geometric sans says "technical craft" without being trendy. Inter is the readable workhorse. Mono grounds the engineering identity. |
| 2026-04-10 | Dark monochrome + #4ade80 green | Green says "terminal, systems, alive." Distinct from blue/purple that most dev portfolios default to. |
| 2026-04-10 | Asymmetric editorial layout | Anti-template move. Reference sites (cydstumpel) prove irregular layouts feel human. |
| 2026-04-10 | 3 motion roles only | Codex + Claude cross-model consensus: too much motion competes with message. Constrain to hero atmosphere, narrative transitions, scroll reveals. |
| 2026-04-10 | Budget range starts at $10k | Positioning is premium. "Under $5k" attracts wrong clients for an experienced senior engineer. |
