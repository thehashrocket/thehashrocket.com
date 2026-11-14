import { describe, it, expect } from "vitest";
import { caseStudySlugs } from "../lib/case-studies";
import { locationSlugs } from "../lib/locations";
import sitemap from "../app/sitemap";
import { OFFER_ROUTES, OFFER_ROUTE_UPDATED } from "../lib/site";

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

  // Value: protects=offer page dates are real calendar dates that aren't ahead of the build;
  //   fails_when=a date is mistyped, or is set ahead instead of refreshed on merge day;
  //   why_new=offer dates moved into OFFER_ROUTE_UPDATED; seam=none; no_claim=the date matches the last edit
  it("offer route dates are YYYY-MM-DD and not in the future", () => {
    // One day of slack: dates are written in local (Pacific) time, and CI clocks run in UTC.
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    for (const route of OFFER_ROUTES) {
      const date = OFFER_ROUTE_UPDATED[route];
      expect(date, route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(date)), route).toBe(false);
      expect(date <= tomorrow, `${route}: ${date} is in the future`).toBe(true);
    }
  });

  it("all lastModified are static strings, not dynamic Date instances", () => {
    for (const entry of entries) {
      if (entry.lastModified !== undefined) {
        expect(entry.lastModified).not.toBeInstanceOf(Date);
      }
    }
  });
});
