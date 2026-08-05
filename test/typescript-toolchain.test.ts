import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";

// TypeScript 7 is the native Go port. It ships no JavaScript compiler API
// (`require("typescript")` resolves to lib/version.cjs) and no tsserver, so
// typescript-eslint cannot load under it — @typescript-eslint/typescript-estree
// reads `ts.ModuleKind.CommonJs` at module load and crashes ESLint outright.
// No typescript-eslint release supports TS 7 yet; latest and canary both cap
// their peer range at "<6.1.0".
//
// So this repo pins `typescript` to 6 for ESLint and `next build`, and installs
// TypeScript 7 alongside under the `typescript7` alias for fast typechecking.
//
// The trap: the alias package also declares a `tsc` bin, and it WINS the
// node_modules/.bin/tsc name. A bare `tsc` or `pnpm exec tsc` therefore runs
// 7.0.2, not 6 — silently, with no error. That is the same shape of silent
// config failure that let 35 Dependabot alerts sit for twelve weeks, so it gets
// the same treatment: a test that fails loudly if the invariant is broken.

const repoRoot = join(__dirname, "..");

interface PackageJson {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
}

const pkg: PackageJson = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
);

describe("package.json TypeScript toolchain", () => {
  it("keeps the typescript devDependency on 6.x", () => {
    // typescript-eslint peers on ">=4.8.4 <6.1.0". Bumping this to 7 does not
    // just warn — it crashes ESLint before it lints a single file.
    expect(pkg.devDependencies.typescript).toMatch(/^\^?6\./);
  });

  it("installs TypeScript 7 under the typescript7 alias", () => {
    expect(pkg.devDependencies.typescript7).toMatch(/^npm:typescript@\^?7\./);
  });

  it("pins the typecheck script to the TypeScript 6 compiler by path", () => {
    // A bare `tsc` here would resolve to node_modules/.bin/tsc, which the
    // typescript7 alias owns — silently switching compilers.
    const script = pkg.scripts.typecheck;
    expect(script).toBe("node node_modules/typescript/lib/tsc.js --noEmit");
    expect(script).not.toMatch(/(^|\s)tsc\s/);
  });

  it("pins the typecheck:fast script to the TypeScript 7 compiler by path", () => {
    expect(pkg.scripts["typecheck:fast"]).toBe(
      "node node_modules/typescript7/lib/tsc.js --noEmit",
    );
  });
});

interface WorkflowJob {
  steps?: Array<{ run?: string; uses?: string }>;
}

interface Workflow {
  jobs: Record<string, WorkflowJob>;
}

describe(".github/workflows/ci.yml TypeScript step", () => {
  const workflow = load(
    readFileSync(join(repoRoot, ".github/workflows/ci.yml"), "utf8"),
  ) as Workflow;

  const verifyRunSteps = (workflow.jobs.verify.steps ?? [])
    .map((s) => s.run ?? "")
    .filter(Boolean);

  it("type checks via the pinned typecheck script", () => {
    expect(verifyRunSteps).toContain("pnpm run typecheck");
  });

  it("never invokes a bare tsc, which would resolve to TypeScript 7", () => {
    // `pnpm exec tsc --noEmit` reads as "check types with the project compiler"
    // but silently runs 7.0.2 because the alias owns the .bin/tsc name.
    for (const step of verifyRunSteps) {
      expect(step, `CI step "${step}" invokes tsc directly`).not.toMatch(
        /(^|\s|\/)tsc(\s|$)/,
      );
    }
  });
});
