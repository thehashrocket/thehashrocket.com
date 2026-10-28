import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The `pnpm.overrides` block is a security control, not a preference. Two of
// this project's transitive dependencies resolve to versions with open
// advisories unless they are pinned above the patch floor:
//
//   postcss — `next` depends on a range that resolves to 8.4.31, which carries
//             GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849,
//             and GHSA-fxqj-rqcc-2cmp. The newest of those is patched in
//             8.5.23.
//   sharp   — resolves to 0.34.5, below the libvips advisory floor of 0.35.0.
//
// Nothing else catches a regression here. `pnpm audit` would, but CI does not
// run it — CI runs lint, typecheck, test, and build. So deleting a pin, or
// letting a Dependabot bump rewrite one to a lower floor, would ship a
// vulnerable tree on green CI. That is the same silent-failure shape that let
// 35 alerts sit for twelve weeks, so it gets the same treatment: a test.
//
// These floors are correct as of 2026-08-10. Raise them when a new advisory
// lands; never lower them. The block should stay exactly this small — an
// override outlives its advisory and then silently pins the tree to a stale
// resolution, so re-audit (delete the block, `pnpm install --lockfile-only`,
// `pnpm audit`) rather than accumulating pins.

const repoRoot = join(__dirname, "..");

interface PackageJson {
  pnpm?: { overrides?: Record<string, string> };
  overrides?: Record<string, string>;
}

const pkg: PackageJson = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
);

const overrides = pkg.pnpm?.overrides ?? {};

/** Lowest version an override may pin to, per the newest advisory it closes. */
const ADVISORY_FLOORS: Record<string, [number, number, number]> = {
  postcss: [8, 5, 23],
  sharp: [0, 35, 0],
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

describe("pnpm.overrides security pins", () => {
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

  it("keeps a caret range so patch releases still flow in", () => {
    // An exact pin (no caret) freezes the dependency and stops future patches
    // from landing, which turns a security control into a staleness source.
    for (const name of Object.keys(ADVISORY_FLOORS)) {
      expect(overrides[name]).toMatch(/^\^/);
    }
  });
});
