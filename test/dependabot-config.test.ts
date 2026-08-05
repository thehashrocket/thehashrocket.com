import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";

// Regression tests for the 2026-08 Dependabot backlog: 35 alerts (2 critical,
// 18 high) sat unfixed for twelve weeks. Two silent failures caused it, and
// neither surfaced an error anywhere — which is exactly why they need tests.
//
//   1. `package-ecosystem: "pnpm"` is not a real value. GitHub has no pnpm
//      ecosystem; npm/yarn/pnpm all use "npm" and the package manager is
//      inferred from the lockfile. An invalid value makes the whole file fail
//      to parse, silently disabling version updates.
//   2. Dependabot keeps one open PR per group, so a single unmerged PR blocks
//      every advisory filed after it. Splitting security updates by dependency
//      type keeps a stuck devDependency off the production path.

const repoRoot = join(__dirname, "..");

function loadYaml<T>(relativePath: string): T {
  return load(readFileSync(join(repoRoot, relativePath), "utf8")) as T;
}

// https://docs.github.com/code-security/dependabot/ecosystems-supported-by-dependabot
const VALID_ECOSYSTEMS = new Set([
  "bun",
  "bundler",
  "cargo",
  "composer",
  "devcontainers",
  "docker",
  "docker-compose",
  "dotnet-sdk",
  "elm",
  "gitsubmodule",
  "github-actions",
  "gomod",
  "gradle",
  "helm",
  "maven",
  "mix",
  "npm",
  "nuget",
  "pip",
  "pub",
  "swift",
  "terraform",
  "uv",
  "vcpkg",
]);

interface DependabotUpdate {
  "package-ecosystem": string;
  directory?: string;
  groups?: Record<string, { "applies-to"?: string; "dependency-type"?: string }>;
}

interface DependabotConfig {
  version: number;
  updates: DependabotUpdate[];
}

describe(".github/dependabot.yml", () => {
  const config = loadYaml<DependabotConfig>(".github/dependabot.yml");

  it("parses as valid YAML with version 2", () => {
    expect(config.version).toBe(2);
    expect(Array.isArray(config.updates)).toBe(true);
  });

  it("uses only ecosystem values GitHub actually recognizes", () => {
    for (const update of config.updates) {
      expect(VALID_ECOSYSTEMS).toContain(update["package-ecosystem"]);
    }
  });

  it('declares the JavaScript ecosystem as "npm", not "pnpm"', () => {
    const ecosystems = config.updates.map((u) => u["package-ecosystem"]);
    expect(ecosystems).toContain("npm");
    expect(ecosystems).not.toContain("pnpm");
  });

  it("splits security updates into production and development groups", () => {
    const npm = config.updates.find((u) => u["package-ecosystem"] === "npm");
    expect(npm).toBeDefined();

    const securityGroups = Object.entries(npm!.groups ?? {}).filter(
      ([, group]) => group["applies-to"] === "security-updates",
    );

    // One group would mean one open PR at a time — the exact condition that
    // let a stale vitest PR block eleven later advisories.
    expect(securityGroups.length).toBeGreaterThanOrEqual(2);
    const types = securityGroups.map(([, g]) => g["dependency-type"]);
    expect(types).toContain("production");
    expect(types).toContain("development");
  });

  it("names every security group with the security- prefix the CI job matches", () => {
    // .github/workflows/ci.yml gates auto-merge on
    // startsWith(dependency-group, 'security-'). A rename here without a
    // rename there silently stops all auto-merging.
    for (const update of config.updates) {
      for (const [name, group] of Object.entries(update.groups ?? {})) {
        if (group["applies-to"] === "security-updates") {
          expect(name.startsWith("security-")).toBe(true);
        }
      }
    }
  });

  it("does not prefix non-security groups with security-", () => {
    for (const update of config.updates) {
      for (const [name, group] of Object.entries(update.groups ?? {})) {
        if (group["applies-to"] !== "security-updates") {
          expect(name.startsWith("security-")).toBe(false);
        }
      }
    }
  });

  it("gives every ecosystem a security-updates group", () => {
    // An ecosystem with no security-updates group still receives advisories —
    // they just arrive ungrouped, so dependency-group is empty, startsWith()
    // is false, and they silently never auto-merge. This is exactly the gap
    // the github-actions entry had.
    for (const update of config.updates) {
      const securityGroups = Object.values(update.groups ?? {}).filter(
        (g) => g["applies-to"] === "security-updates",
      );
      expect(
        securityGroups.length,
        `ecosystem "${update["package-ecosystem"]}" has no security-updates group`,
      ).toBeGreaterThan(0);
    }
  });

  it("declares applies-to explicitly on every group", () => {
    // applies-to defaults to version-updates when omitted. Relying on that
    // default is how the Actions group ended up covering only half the job.
    for (const update of config.updates) {
      for (const [name, group] of Object.entries(update.groups ?? {})) {
        expect(
          group["applies-to"],
          `group "${name}" omits applies-to`,
        ).toBeDefined();
      }
    }
  });
});

interface WorkflowJob {
  needs?: string | string[];
  if?: string;
  steps?: Array<{ run?: string; uses?: string; if?: string }>;
}

interface Workflow {
  jobs: Record<string, WorkflowJob>;
}

describe(".github/workflows/ci.yml", () => {
  const workflow = loadYaml<Workflow>(".github/workflows/ci.yml");
  const autoMerge = workflow.jobs["dependabot-auto-merge"];

  it("defines a verify job and a dependabot-auto-merge job", () => {
    expect(workflow.jobs.verify).toBeDefined();
    expect(autoMerge).toBeDefined();
  });

  it("blocks auto-merge on the verify job", () => {
    // Without `needs`, the merge races CI and can land a red build.
    const needs = autoMerge.needs;
    const needsList = Array.isArray(needs) ? needs : [needs];
    expect(needsList).toContain("verify");
  });

  it("restricts auto-merge to the dependabot actor", () => {
    expect(autoMerge.if).toContain("dependabot[bot]");
  });

  it("merges directly rather than with --auto", () => {
    // `gh pr merge --auto` merges immediately unless branch protection with
    // required checks is configured. `needs: verify` is the gate here, so the
    // merge must be a plain one — --auto would defeat it.
    const runSteps = (autoMerge.steps ?? [])
      .map((s) => s.run ?? "")
      .join("\n");
    expect(runSteps).toContain("gh pr merge");
    expect(runSteps).not.toContain("--auto");
  });

  it("only auto-merges patch and minor security updates", () => {
    const mergeStep = autoMerge.steps?.find((s) =>
      (s.run ?? "").includes("gh pr merge"),
    );
    expect(mergeStep).toBeDefined();

    const condition = mergeStep!.if ?? "";
    expect(condition).toContain("security-");
    expect(condition).toContain("semver-patch");
    expect(condition).toContain("semver-minor");
    // A major bump can break things CI won't catch — it must never merge.
    expect(condition).not.toContain("semver-major");
  });
});
