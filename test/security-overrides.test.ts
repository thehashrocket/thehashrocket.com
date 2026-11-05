import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";

// The `overrides` block in pnpm-workspace.yaml is a security control, not a preference. Four of
// this project's transitive dependencies resolve to versions with open
// advisories unless they are pinned above the patch floor:
//
//   postcss — `next` depends on a range that resolves to 8.4.31, which carries
//             GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849,
//             and GHSA-fxqj-rqcc-2cmp. The newest of those is patched in
//             8.5.23.
//   sharp   — resolves to 0.34.5, below the libvips advisory floor of 0.35.0.
//   minimatch — typescript-estree depends on ^10, inside GHSA-g3hv-75wg-m249.
//               Scoped to that parent; eslint is the only thing that runs it.
//   glob    — @sentry/bundler-plugins before 11.11 depends on ^13, inside
//             GHSA-3g3m-2fjr-6pw4. Drop this pin once Sentry is on 11.11+.
//
// Nothing else catches a regression here on ordinary PRs. `pnpm audit` would, but
// it only blocks Dependabot security PRs; everywhere else it is advisory. So deleting a pin, or
// letting a Dependabot bump rewrite one to a lower floor, would ship a
// vulnerable tree on green CI. That is the same silent-failure shape that let
// 35 alerts sit for twelve weeks, so it gets the same treatment: a test.
//
// These floors are correct as of 2026-11-05. Raise them when a new advisory
// lands; never lower them. The block should stay exactly this small — an
// override outlives its advisory and then silently pins the tree to a stale
// resolution, so re-audit (delete the block, `pnpm install --lockfile-only`,
// `pnpm audit`) rather than accumulating pins.

const repoRoot = join(__dirname, "..");

interface PnpmWorkspace {
  overrides?: Record<string, string>;
}

const workspace = load(
  readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8"),
) as PnpmWorkspace;

const overrides = workspace.overrides ?? {};

/** Lowest version an override may pin to, per the newest advisory it closes. */
const ADVISORY_FLOORS: Record<string, [number, number, number]> = {
  postcss: [8, 5, 23],
  sharp: [0, 35, 0],
  "@typescript-eslint/typescript-estree>minimatch": [11, 0, 1],
  "@sentry/bundler-plugins>glob": [14, 0, 2],
};

function parseFloor(range: string): [number, number, number] {
  const match = /^\^?(\d+)\.(\d+)\.(\d+)$/.exec(range);

  if (!match) {
    throw new Error(`override range "${range}" is not a plain caret/exact pin`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function gte(a: [number, number, number], b: [number, number, number]) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }

  return true;
}

describe("pnpm-workspace.yaml security pins", () => {
  for (const [name, floor] of Object.entries(ADVISORY_FLOORS)) {
    it(`pins ${name} at or above ${floor.join(".")}`, () => {
      const range = overrides[name];

      expect(range, `${name} override is missing`).toBeDefined();
      expect(
        gte(parseFloor(range!), floor),
        `${name} pinned to ${range}, below the advisory floor ${floor.join(".")}`,
      ).toBe(true);
    });
  }

  it("holds only the documented pins", () => {
    // Each override needs an advisory behind it. A dead pin silently holds the
    // tree at a stale resolution.
    expect(Object.keys(overrides).sort()).toEqual(Object.keys(ADVISORY_FLOORS).sort());
  });

  it("resolves no vulnerable glob or minimatch in the lockfile", () => {
    // A scoped pin goes inert if its parent is renamed, and it cannot reach a
    // second parent. The lockfile is what actually ships.
    const lock = readFileSync(join(repoRoot, "pnpm-lock.yaml"), "utf8");
    const resolved = (name: string) =>
      [...lock.matchAll(new RegExp(`^  ${name}@(\\d+)\\.(\\d+)\\.(\\d+):$`, "gm"))].map(
        (match) => [Number(match[1]), Number(match[2]), Number(match[3])] as [number, number, number],
      );

    expect(resolved("glob").length).toBeGreaterThan(0);
    for (const version of resolved("glob")) {
      expect(gte(version, [14, 0, 2]), `glob ${version.join(".")}`).toBe(true);
    }

    expect(resolved("minimatch").length).toBeGreaterThan(0);
    for (const version of resolved("minimatch")) {
      const affected = gte(version, [7, 0, 0]) && !gte(version, [11, 0, 1]);
      expect(affected, `minimatch ${version.join(".")}`).toBe(false);
    }
  });

  it("keeps a caret range so patch releases still flow in", () => {
    // An exact pin (no caret) freezes the dependency and stops future patches
    // from landing, which turns a security control into a staleness source.
    for (const name of Object.keys(ADVISORY_FLOORS)) {
      expect(overrides[name]).toMatch(/^\^/);
    }
  });
});
