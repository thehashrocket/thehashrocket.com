// The site's credibility rests on every claim being one the owner can defend on
// a sales call. These tests stop the known-bad ones from creeping back. They
// cannot tell whether a number is true; a person has to check that.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { caseStudies, caseStudySlugs } from "../lib/case-studies";
import { locations, locationSlugs } from "../lib/locations";
import { BUILD_PRICE_FLOOR, formatUsd, offerLadderText } from "../lib/offers";
import { contactIntro } from "../lib/contact-intro";
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

  // A price typed outside lib/offers.ts drifts the day the offer changes. The pattern is
  // independent of today's values; the lookahead lets magnitude proof metrics ("$200M+") through.
  const PRICE_LITERAL = /\$\d[\d,.]*(?![\d,.]|\s*[MBmb]\b)\s*[kK]?\+?/;

  // Value: protects=every offer price renders from lib/offers.ts, whatever its value; fails_when=a page, location FAQ or badge types a price;
  //   why_new=the old test matched only the current REVIEW_PRICE and missed HeroSection's "$10K+"; seam=none; no_claim=the prices are right
  it("no price literal appears outside lib/offers.ts", () => {
    const hits = sources.flatMap(({ path, text }) => {
      if (path === join("lib", "offers.ts") || path === join("lib", "case-studies.ts")) return [];
      return text.split("\n").flatMap((line, i) => (PRICE_LITERAL.test(line) ? [`${path}:${i + 1}: ${line.trim()}`] : []));
    });
    expect(hits).toEqual([]);
  });

  it("the price-literal pattern bans prices but allows magnitude metrics", () => {
    for (const price of ["$10K+", "$1,500", "$3,500–$5,000", "$3.5K", "$10,000.", "$1,500 budget", "$5,000 minimum", "$300 monthly"]) expect(price, price).toMatch(PRICE_LITERAL);
    for (const metric of ["$200M+", "$2B", "$40 M"]) expect(metric, metric).not.toMatch(PRICE_LITERAL);
  });

  it("the build floor still shows on /contact and in every location's pricing answer", () => {
    expect(contactIntro(undefined).text).toContain(formatUsd(BUILD_PRICE_FLOOR));
    expect(contactIntro(undefined).text).toContain(offerLadderText());
    for (const slug of locationSlugs) {
      expect(locations[slug].faqs.some((faq) => faq.answer.includes(offerLadderText())), slug).toBe(true);
    }
  });

  it("cal.com is never hardcoded", () => {
    const hits = sources.filter(({ text }) => /https?:\/\/(www\.)?cal\.com/i.test(text));
    expect(hits.map((h) => h.path)).toEqual([]);
  });

  it("every source the site hardcodes survives the allow-list", () => {
    const literals = sources.flatMap(({ text }) =>
      [...text.matchAll(/source="([^"]+)"|getContactHref\("([^"]+)"\)/g)].map((match) => match[1] ?? match[2]),
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
