// Value: protects=every internal link the site hardcodes resolves to a page that exists;
//   fails_when=a link to a route that hasn't shipped (e.g. /care-plan, /talks before release 2) or a renamed route;
//   why_new=nothing checked internal hrefs against app/; seam=none;
//   no_claim=links built from runtime data (template literals are skipped) or external URLs
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { offerLadderParts } from "../lib/offers";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

/** True when app/ has a page for this path, allowing dynamic [segment] folders. */
function routeExists(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  let dirs = ["app"];
  for (const segment of segments) {
    dirs = dirs.flatMap((dir) => {
      if (!existsSync(dir)) return [];
      const exact = join(dir, segment);
      const dynamic = readdirSync(dir)
        .filter((entry) => /^\[[^\]]+\]$/.test(entry))
        .map((entry) => join(dir, entry));
      return [exact, ...dynamic].filter((candidate) => existsSync(candidate));
    });
  }
  return dirs.some((dir) => existsSync(join(dir, "page.tsx")));
}

const LINK_PATTERNS = [/href="(\/[^"]*)"/g, /href: "(\/[^"]*)"/g];

describe("internal links", () => {
  it("every hardcoded internal link has a page", () => {
    const files = ["app", "components", "lib"].flatMap(sourceFiles);
    const links = files.flatMap((path) => {
      const text = readFileSync(path, "utf8");
      return LINK_PATTERNS.flatMap((pattern) =>
        [...text.matchAll(pattern)].map((match) => ({ path, href: match[1] })),
      );
    });
    const ladderLinks = offerLadderParts().flatMap((part) => (part.href ? [{ path: "offerLadderParts()", href: part.href }] : []));
    expect(links.length).toBeGreaterThan(0);
    const missing = [...links, ...ladderLinks]
      .map(({ path, href }) => ({ path, pathname: href.split(/[?#]/)[0] }))
      .filter(({ pathname }) => !routeExists(pathname))
      .map(({ path, pathname }) => `${path}: ${pathname}`);
    expect(missing).toEqual([]);
  });

  it("knows the difference between shipped and unshipped routes", () => {
    expect(routeExists("/automation-sprint")).toBe(true);
    expect(routeExists("/work/print-portal")).toBe(true);
    expect(routeExists("/talks")).toBe(true);
    // The care plan (lane B) waits for the first delivered sprint or review.
    expect(routeExists("/care-plan")).toBe(false);
  });
});
