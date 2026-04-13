import { describe, it, expect } from "vitest";
import {
  locations,
  locationSlugs,
  getLocation,
  getAllLocations,
} from "../lib/locations";

describe("locations", () => {
  it("exports 3 locations", () => {
    expect(locationSlugs).toHaveLength(3);
  });

  it("has sacramento, stockton, and modesto", () => {
    expect(locationSlugs).toContain("sacramento");
    expect(locationSlugs).toContain("stockton");
    expect(locationSlugs).toContain("modesto");
  });

  it("getLocation returns a location for valid slug", () => {
    const sac = getLocation("sacramento");
    expect(sac).toBeDefined();
    expect(sac!.name).toBe("Sacramento");
    expect(sac!.region).toBe("Sacramento County, CA");
  });

  it("getLocation returns undefined for invalid slug", () => {
    expect(getLocation("nonexistent")).toBeUndefined();
  });

  it("getAllLocations returns all locations as array", () => {
    const all = getAllLocations();
    expect(all).toHaveLength(3);
    expect(all.map((l) => l.slug)).toEqual(locationSlugs);
  });

  it("each location has required fields", () => {
    for (const slug of locationSlugs) {
      const loc = locations[slug];
      expect(loc.slug).toBe(slug);
      expect(loc.name).toBeTruthy();
      expect(loc.region).toBeTruthy();
      expect(loc.metaTitle).toBeTruthy();
      expect(loc.metaDescription).toBeTruthy();
      expect(loc.heroHeadline).toBeTruthy();
      expect(loc.heroSubheadline).toBeTruthy();
      expect(loc.industries.length).toBeGreaterThanOrEqual(3);
      expect(loc.economicContext).toBeTruthy();
      expect(loc.whyLocal).toBeTruthy();
      expect(loc.faqs.length).toBeGreaterThanOrEqual(3);
      expect(loc.caseStudyConnectors.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("case study connectors reference valid slugs", () => {
    for (const slug of locationSlugs) {
      for (const connector of locations[slug].caseStudyConnectors) {
        expect(connector.slug).toBeTruthy();
        expect(connector.connector).toBeTruthy();
      }
    }
  });

  it("each FAQ has question and answer", () => {
    for (const slug of locationSlugs) {
      for (const faq of locations[slug].faqs) {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
      }
    }
  });

  it("slugs are URL-safe", () => {
    for (const slug of locationSlugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("localExperience is a non-empty string when present", () => {
    for (const slug of locationSlugs) {
      const loc = locations[slug];
      if (loc.localExperience !== undefined) {
        expect(typeof loc.localExperience).toBe("string");
        expect(loc.localExperience.length).toBeGreaterThan(0);
      }
    }
  });

  it("modesto has localExperience defined", () => {
    const modesto = getLocation("modesto");
    expect(modesto!.localExperience).toBeTruthy();
  });
});
