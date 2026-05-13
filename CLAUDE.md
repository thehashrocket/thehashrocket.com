
## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Design System
Always read docs/DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match docs/DESIGN.md.

## Architecture & Context
Read docs/ARCHITECTURE.md for system architecture, component tree, data flow, and tech stack.
Read docs/DOMAIN.md for business context, project domains, and brand identity.

## Node.js
This project uses nvm for Node version management. The required version is pinned in `.nvmrc` (currently 24.11). Always run `nvm use` before executing any Node/npm commands to ensure the correct version is active.

## Testing
Run `npm test` (vitest) for unit tests. Test files live in `test/`.
Run `npm run test:e2e` (Playwright) for E2E tests. Specs live in `test/e2e/`.

## Conventions
- 3D scenes go in `components/scenes/`, UI components in `components/ui/`, shell in `components/layout/`
- Scene state is managed via Zustand store in `lib/store.ts` — pages dispatch, canvas reads
- Server Actions go in `lib/actions.ts`
- OG image template and font utilities live in `lib/og-image.tsx` and `lib/og-fonts.ts`; each route's `opengraph-image.tsx` imports from there
- CSS custom properties defined in `app/globals.css`, consumed by Tailwind utilities

## GBrain Configuration (configured by /setup-gbrain)
- Mode: local-stdio
- Engine: postgres (Supabase, Free tier — pauses after 7d inactivity)
- Config file: ~/.gbrain/config.json (mode 0600)
- Setup date: 2026-05-12
- MCP registered: yes (user scope)
- Artifacts sync: artifacts-only
- Artifacts remote: https://github.com/thehashrocket/gstack-artifacts-jasonshultz
- Current repo policy: read-write

## GBrain Search Guidance (configured by /sync-gbrain)
<!-- gstack-gbrain-search-guidance:start -->

GBrain is set up and synced on this machine. The agent should prefer gbrain
over Grep when the question is semantic or when you don't know the exact
identifier yet. Two indexed corpora available via the `gbrain` CLI:
- This repo's code (registered as `gstack-code-<repo>` source).
- `~/.gstack/` curated memory (registered as `gstack-artifacts-jasonshultz` source via
  the existing federation pipeline).

Prefer gbrain when:
- "Where is X handled?" / semantic intent, no exact string yet:
    `gbrain search "<terms>"` or `gbrain query "<question>"`
- "Where is symbol Y defined?" / symbol-based code questions:
    `gbrain code-def <symbol>` or `gbrain code-refs <symbol>`
- "What calls Y?" / "What does Y depend on?":
    `gbrain code-callers <symbol>` / `gbrain code-callees <symbol>`
- "What did we decide last time?" / past plans, retros, learnings:
    `gbrain search "<terms>" --source gstack-artifacts-jasonshultz`

Grep is still right for known exact strings, regex, multiline patterns, and
file globs. The brain auto-syncs incrementally on every gstack skill start.
Run `/sync-gbrain` to force-refresh, `/sync-gbrain --full` for full reindex.

<!-- gstack-gbrain-search-guidance:end -->
