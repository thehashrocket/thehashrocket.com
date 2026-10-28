
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
This project uses nvm for Node version management. The required version is pinned in `.nvmrc` (currently 24.19.0). Always run `nvm use` before executing any Node/npm commands to ensure the correct version is active.

Stay on the Node 24 line. It is Active LTS and the Vercel default runtime; Node 26 is
current but does not reach LTS until October 2026. Keep `@types/node` on the matching
major (`^24`) — Dependabot will offer a `@types/node` 26 major, and taking it means the
compiler types APIs the deployed runtime does not have, so `pnpm run typecheck` passes
for code that throws in production.

## Package manager — pnpm only, never npm
`pnpm-lock.yaml` is the committed lockfile; `package-lock.json` and `yarn.lock` are gitignored.
Vercel and CI both build with `pnpm install --frozen-lockfile`. Use `pnpm` for everything.

This is not a style preference. Security pins for transitive dependencies live in the
`pnpm.overrides` block in `package.json`, and **npm ignores that field entirely** — it only
reads a top-level `overrides` key, which this project does not have. Running `npm install`
resolves postcss to 8.4.31 and sharp to 0.34.5, both of which carry open advisories that
`pnpm install` patches. An npm-installed tree is a vulnerable tree.

Those two are the only overrides left, and each one is load-bearing: `next` still depends
on a vulnerable postcss, and the sharp that `next` pulls in is below the libvips advisory
floor. Keep the block that small. An override is dead the moment the upstream package
fixes its own range, and a dead override silently pins the tree to an old resolution.
To re-audit: delete the `pnpm.overrides` block, run `pnpm install --lockfile-only`, run
`pnpm audit`, and put back only what the audit actually flags — then `git checkout` the
lockfile if you are not keeping the change.

## TypeScript — two compilers, never call `tsc` directly
Type check with `pnpm run typecheck`. Never write a bare `tsc` in a script, a CI step,
or a terminal command in this repo.

Two compilers are installed on purpose:
- `typescript` (6.x) is the project compiler. ESLint and `next build` both load its
  JavaScript compiler API.
- `typescript7` is an npm alias for `typescript@7`, the native Go port. Use it via
  `pnpm run typecheck:fast` — same result, roughly 5x faster. This is a local
  convenience only. It shells out to a prebuilt Go binary shipped as a platform
  `optionalDependency` (`@typescript/typescript-<os>-<arch>`), so it hard-fails on
  an unsupported platform or under `--no-optional`. Never wire it into CI or a git
  hook; `pnpm run typecheck` is the portable gate.

TypeScript 7 cannot be the project compiler yet. It ships no JS compiler API
(`require("typescript")` resolves to `lib/version.cjs`) and no tsserver, so
`@typescript-eslint/typescript-estree` crashes at module load reading
`ts.ModuleKind.CommonJs` — `pnpm lint` dies with exit 2 before linting anything.
No typescript-eslint release supports TS 7; latest and canary both peer on `<6.1.0`.
Revisit when that changes.

The trap: `typescript7` also declares a `tsc` bin and it **wins**
`node_modules/.bin/tsc`. A bare `tsc` or `pnpm exec tsc` therefore runs 7.x, not 6 —
silently, with no error. Both typecheck scripts invoke a compiler by explicit path
for this reason, and `test/typescript-toolchain.test.ts` fails if that regresses.

## ESLint — pinned to 9.x, do not take the 10 major
`eslint` must stay on `^9`. ESLint 10 removed `context.getFilename()`, and
`eslint-plugin-react` — which `eslint-config-next` depends on transitively — still calls
it. `pnpm lint` dies with exit 2 and `TypeError: contextOrFilename.getFilename is not a
function` before linting a single file. 7.37.5 is the newest `eslint-plugin-react` and it
is not fixed. Revisit when `eslint-config-next` ships a resolution that supports ESLint 10.

`typescript-eslint` already peers on `^10.0.0`, so it is not the blocker — the plugin is.

## Testing
Run `pnpm test` (vitest) for unit tests. Test files live in `test/`.
Run `pnpm run test:e2e` (Playwright) for E2E tests. Specs live in `test/e2e/`.

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
identifier yet.

**This worktree is pinned to a worktree-scoped code source** via the
`.gbrain-source` file in the repo root (kubectl-style context). Any
`gbrain code-def`, `code-refs`, `code-callers`, `code-callees`, or `query`
call from anywhere under this worktree routes to that source by default —
no `--source` flag needed. Conductor sibling worktrees of the same repo
each have their own pin and their own indexed pages, so semantic results
match the actual code on disk in this worktree.

Two indexed corpora available via the `gbrain` CLI:
- This worktree's code (auto-pinned via `.gbrain-source`).
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
file globs. Run `/sync-gbrain` after meaningful code changes; for ongoing
auto-sync across all worktrees, run `gbrain autopilot --install` once per
machine — gbrain's daemon handles incremental refresh on a schedule.

<!-- gstack-gbrain-search-guidance:end -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
