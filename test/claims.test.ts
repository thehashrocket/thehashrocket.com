// The site's credibility rests on every claim being one the owner can defend on
// a sales call. These tests stop the known-bad ones from creeping back. They
// cannot tell whether a number is true; a person has to check that.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { caseStudies, caseStudySlugs } from "../lib/case-studies";
import { locations, locationSlugs } from "../lib/locations";
import { REVIEW_PRICE, formatUsd } from "../lib/offers";
import { normalizeSource } from "../lib/sources";

const SOURCE_DIRS = ["app", "components", "lib"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

const sources = SOURCE_DIRS.flatMap(sourceFiles).map((path) => ({
  path,
  text: readFileSync(path, "utf8"),
}));

// Experience we can't back with a case study, institutions we haven't worked
// with, and numbers nobody could source.
const BANNED = [
  /\bgovernment\b/i,
  /\bFSMA\b/,
  /UC Davis/,
  /Sutter/,
  /Gallo/,
  /Doctors Medical/,
  /Silicon Valley/,
  /decision fatigue/,
  /\$2M\+/,
  /50,000\+/,
  // Fixing AI-built apps is a crowded field; never claim exclusivity or a rescue count.
  /nobody else (offers|does)/i,
  /only one (who|offering)/i,
  /rescued \d+/i,
];

describe("claims", () => {
  it("no banned claim appears in site source", () => {
    const hits = sources.flatMap(({ path, text }) =>
      BANNED.filter((pattern) => pattern.test(text)).map((pattern) => `${path}: ${pattern}`),
    );
    expect(hits).toEqual([]);
  });

  it("the review price is only ever rendered from lib/offers.ts", () => {
    const literal = new RegExp(
      `\\$${REVIEW_PRICE.toLocaleString("en-US").replace(",", ",?")}(?![\\d,])`,
    );
    const hits = sources.filter(({ path, text }) => path !== join("lib", "offers.ts") && literal.test(text));
    expect(formatUsd(REVIEW_PRICE)).toMatch(literal);
    expect(hits.map((h) => h.path)).toEqual([]);
  });

  it("projects still typically start at $10,000 where they did before", () => {
    expect(readFileSync("app/contact/page.tsx", "utf8")).toContain("$10,000");
    for (const slug of locationSlugs) {
      expect(locations[slug].faqs.some((faq) => /\$10,000/.test(faq.answer)), slug).toBe(true);
    }
  });

  it("cal.com is never hardcoded", () => {
    const hits = sources.filter(({ text }) => /https?:\/\/(www\.)?cal\.com/i.test(text));
    expect(hits.map((h) => h.path)).toEqual([]);
  });

  it("every source the site hardcodes survives the allow-list", () => {
    const literals = sources.flatMap(({ text }) =>
      [...text.matchAll(/source="([^"]+)"/g)].map((match) => match[1]),
    );
    expect(literals.length).toBeGreaterThan(0);
    for (const source of literals) expect(normalizeSource(source), source).toBe(source);
  });

  it("every study has a result bar, a specific CTA, and a visual", () => {
    for (const slug of caseStudySlugs) {
      const study = caseStudies[slug];
      expect(study.results.length, slug).toBeGreaterThanOrEqual(2);
      expect(study.cta.heading, slug).toBeTruthy();
      expect(study.cta.body, slug).toBeTruthy();
      expect(study.diagram.length, slug).toBeGreaterThan(0);
    }
  });

  it("CTAs are specific to each study", () => {
    const headings = caseStudySlugs.map((slug) => caseStudies[slug].cta.heading);
    expect(new Set(headings).size).toBe(headings.length);
  });

  it("in-progress work says so in its results", () => {
    for (const slug of caseStudySlugs) {
      const study = caseStudies[slug];
      if (study.status !== "In progress") continue;
      for (const result of study.results) expect(result).toMatch(/^Target:/);
    }
  });

  it("each location shows exactly three studies that exist", () => {
    for (const slug of locationSlugs) {
      const connectors = locations[slug].caseStudyConnectors;
      expect(connectors, slug).toHaveLength(3);
      for (const connector of connectors) {
        expect(caseStudySlugs, slug).toContain(connector.slug);
      }
    }
  });

  it("every industry tile says how the work applies", () => {
    for (const slug of locationSlugs) {
      for (const industry of locations[slug].industries) {
        expect(industry.line, `${slug}: ${industry.name}`).toBeTruthy();
      }
    }
  });
});
