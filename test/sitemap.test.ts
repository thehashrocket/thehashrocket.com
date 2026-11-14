import { describe, it, expect } from "vitest";
import { caseStudySlugs } from "../lib/case-studies";
import { locationSlugs } from "../lib/locations";
import sitemap from "../app/sitemap";
import { OFFER_ROUTES } from "../lib/site";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("includes all case study slugs", () => {
    for (const slug of caseStudySlugs) {
      expect(urls).toContain(`https://www.jasonshultz.com/work/${slug}`);
    }
  });

  it("includes all location slugs", () => {
    for (const slug of locationSlugs) {
      expect(urls).toContain(`https://www.jasonshultz.com/locations/${slug}`);
    }
  });

  it("includes core pages", () => {
    expect(urls).toContain("https://www.jasonshultz.com");
    expect(urls).toContain("https://www.jasonshultz.com/work");
    expect(urls).toContain("https://www.jasonshultz.com/about");
    expect(urls).toContain("https://www.jasonshultz.com/contact");
  });

  // Value: protects=every offer page is in the sitemap; fails_when=a new offer route skips app/sitemap.ts;
  //   why_new=the old test listed two offer URLs by hand; seam=none; no_claim=search engines crawl them
  it("includes every offer route", () => {
    for (const route of OFFER_ROUTES) expect(urls).toContain(`https://www.jasonshultz.com${route}`);
  });

  it("all lastModified are static strings, not dynamic Date instances", () => {
    for (const entry of entries) {
      if (entry.lastModified !== undefined) {
        expect(entry.lastModified).not.toBeInstanceOf(Date);
      }
    }
  });
});
