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
  engines?: Record<string, string>;
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

describe("package.json lint and runtime toolchain", () => {
  it("keeps the eslint devDependency on 9.x", () => {
    // ESLint 10 removed context.getFilename(). eslint-plugin-react (a transitive
    // dep of eslint-config-next) still calls it, so `pnpm lint` dies with exit 2
    // and "contextOrFilename.getFilename is not a function" before linting a
    // single file. 7.37.5 is the newest eslint-plugin-react and is not fixed.
    //
    // CI runs lint with continue-on-error, so this crash would NOT turn CI red.
    // That is exactly why the pin needs a test.
    expect(pkg.devDependencies.eslint).toMatch(/^\^?9\./);
  });

  it("agrees on one Node major across .nvmrc, engines, and @types/node", () => {
    // Three files independently name the Node version, and each is read by a
    // different consumer:
    //
    //   .nvmrc        -> local `nvm use` and CI (actions/setup-node)
    //   engines.node  -> the Vercel build; per Vercel's docs this overrides
    //                    the dashboard Project Settings value
    //   @types/node   -> what the compiler thinks exists at runtime
    //
    // Drift between them is silent and asymmetric. Types ahead of the runtime
    // are the dangerous direction: typecheck goes green for APIs the deployed
    // Node does not have, and it fails in production instead.
    const nvmrc = readFileSync(join(repoRoot, ".nvmrc"), "utf8").trim();
    const nodeMajor = nvmrc.split(".")[0];

    // Node 26 does not reach Active LTS until October 2026. Moving off 24 is a
    // deliberate act; this assertion makes it one.
    expect(nodeMajor).toBe("24");
    expect(pkg.engines?.node).toBe(`${nodeMajor}.x`);
    expect(pkg.devDependencies["@types/node"]).toMatch(
      new RegExp(`^\\^?${nodeMajor}\\.`),
    );
  });
});

interface WorkflowStep {
  run?: string;
  uses?: string;
  if?: string;
  "continue-on-error"?: boolean | string;
}

interface WorkflowJob {
  steps?: WorkflowStep[];
  needs?: string | string[];
  permissions?: Record<string, string>;
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

describe(".github/workflows/ci.yml audit gate", () => {
  const workflow = load(
    readFileSync(join(repoRoot, ".github/workflows/ci.yml"), "utf8"),
  ) as Workflow;

  const verifySteps = workflow.jobs.verify.steps ?? [];
  const auditSteps = verifySteps.filter((s) => s.run?.includes("pnpm audit"));

  const gateFor = (group: string) =>
    auditSteps.find((s) => s.if?.includes(group));

  it("keeps a wide advisory audit that never blocks anyone", () => {
    // The net that catches a new advisory anywhere in the tree. It must stay
    // non-blocking: an unfixable upstream advisory would otherwise turn every
    // unrelated PR red, and that is how audit steps get deleted wholesale.
    const advisory = auditSteps.find((s) => !s.if);

    expect(advisory, "no unconditional `pnpm audit` step").toBeDefined();
    expect(advisory?.["continue-on-error"]).toBe(true);
    expect(advisory?.run?.trim()).toBe("pnpm audit");
  });

  // dependabot-auto-merge squash-merges these with no human in the loop, so
  // "read it on the PR" is vacuous and the audit has to actually block.
  for (const [group, flag] of [
    ["security-production", "--prod"],
    ["security-development", "--dev"],
  ] as const) {
    describe(`${group} gate`, () => {
      it("blocks — no continue-on-error", () => {
        expect(gateFor(group)).toBeDefined();
        expect(gateFor(group)?.["continue-on-error"]).toBeUndefined();
      });

      it(`scopes to ${flag}, the class that PR can actually fix`, () => {
        // dependabot.yml splits security updates prod/dev so a stuck dev
        // advisory cannot hold back a production security patch — PR #30 did
        // exactly that for two months. An unqualified `pnpm audit` in these
        // gates re-couples them and reintroduces that bug.
        expect(gateFor(group)?.run).toContain(flag);
      });

      it("ignores unfixable advisories so automation cannot deadlock", () => {
        expect(gateFor(group)?.run).toContain("--ignore-unfixable");
      });

      it("gates only the patch/minor updates that actually auto-merge", () => {
        // A MAJOR security PR is not auto-merged — it gets a needs-review
        // label and a comment from dependabot-auto-merge. Gating it would
        // redden verify, leave `needs: verify` unsatisfied, and that job would
        // never run, so the label and comment never fire. The PR would sit red
        // with no explanation of what a human is supposed to do.
        const condition = gateFor(group)?.if ?? "";

        expect(condition).toContain("version-update:semver-patch");
        expect(condition).toContain("version-update:semver-minor");
        expect(condition).not.toContain("semver-major");
      });
    });
  }

  it("gates exactly the set that auto-merges, no wider", () => {
    // The gate exists because dependabot-auto-merge merges without a human.
    // If its condition ever drifts from the merge step's, the gate is either
    // blocking PRs a human will review anyway, or letting an unattended merge
    // through unaudited. Both are silent.
    const mergeStep = (
      workflow.jobs["dependabot-auto-merge"].steps ?? []
    ).find((s) => s.run?.includes("gh pr merge"));

    for (const s of [mergeStep?.if, gateFor("security-production")?.if]) {
      expect(s).toContain("version-update:semver-patch");
      expect(s).toContain("version-update:semver-minor");
    }
  });

  it("keeps auto-merge downstream of verify, which is what makes the gate bite", () => {
    // Without `needs: verify`, a red audit would not stop the merge job.
    expect(workflow.jobs["dependabot-auto-merge"]?.needs).toBe("verify");
  });

  it("grants verify the permission fetch-metadata needs to classify PRs", () => {
    // Without pull-requests: read the metadata step fails, dependency-group is
    // empty, both gates silently never fire, and the control degrades to
    // advisory-only without anything going red.
    expect(workflow.jobs.verify.permissions?.["pull-requests"]).toBe("read");
  });
});
