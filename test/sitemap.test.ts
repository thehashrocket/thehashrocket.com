import { describe, it, expect } from "vitest";
import { caseStudySlugs } from "../lib/case-studies";
import { locationSlugs } from "../lib/locations";
import sitemap from "../app/sitemap";

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
    expect(urls).toContain("https://www.jasonshultz.com/ai-app-review");
    expect(urls).toContain("https://www.jasonshultz.com/print-shops");
  });

  it("all lastModified are static strings, not dynamic Date instances", () => {
    for (const entry of entries) {
      if (entry.lastModified !== undefined) {
        expect(entry.lastModified).not.toBeInstanceOf(Date);
      }
    }
  });
});
