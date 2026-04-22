import { describe, it, expect } from "vitest";
import { caseStudySlugs } from "../lib/case-studies";
import { locationSlugs } from "../lib/locations";
import sitemap from "../app/sitemap";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("includes all case study slugs", () => {
    for (const slug of caseStudySlugs) {
      expect(urls).toContain(`https://thehashrocket.com/work/${slug}`);
    }
  });

  it("includes all location slugs", () => {
    for (const slug of locationSlugs) {
      expect(urls).toContain(`https://thehashrocket.com/locations/${slug}`);
    }
  });

  it("includes core pages", () => {
    expect(urls).toContain("https://thehashrocket.com");
    expect(urls).toContain("https://thehashrocket.com/work");
    expect(urls).toContain("https://thehashrocket.com/about");
    expect(urls).toContain("https://thehashrocket.com/contact");
  });

  it("all lastModified are static strings, not dynamic Date instances", () => {
    for (const entry of entries) {
      if (entry.lastModified !== undefined) {
        expect(entry.lastModified).not.toBeInstanceOf(Date);
      }
    }
  });
});
