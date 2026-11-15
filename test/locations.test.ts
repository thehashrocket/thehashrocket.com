import { describe, it, expect } from "vitest";
import {
  locations,
  locationSlugs,
  getLocation,
  getAllLocations,
} from "../lib/locations";
import { formatCareHours, formatCarePrice } from "../lib/offers";

describe("locations", () => {
  it("exports 4 locations", () => {
    expect(locationSlugs).toHaveLength(4);
  });

  it("has sacramento, stockton, and modesto", () => {
    expect(locationSlugs).toContain("sacramento");
    expect(locationSlugs).toContain("stockton");
    expect(locationSlugs).toContain("modesto");
    expect(locationSlugs).toContain("manteca-tracy-lathrop");
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
    expect(all).toHaveLength(4);
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

  // Value: protects=city-page support answers (also emitted as FAQ JSON-LD) state the care plan's price and included hours;
  //   fails_when=an answer goes back to promising open-ended monthly bug fixes, or retypes a care price that can drift;
  //   why_new=those answers contradicted /care-plan's included-hours terms (#89 ship review); seam=none;
  //   no_claim=how Google renders the FAQ
  it("support and maintenance answers match the care plan's terms", () => {
    const support = Object.values(locations).flatMap((loc) =>
      loc.faqs.filter((faq) => /ongoing (support|maintenance)/i.test(faq.question)),
    );
    expect(support.length).toBeGreaterThan(0);
    for (const faq of support) {
      expect(faq.answer, faq.question).toContain(formatCarePrice());
      expect(faq.answer, faq.question).toContain(`${formatCareHours()} hours`);
      expect(faq.answer, faq.question).not.toMatch(/bug fixes and performance work/);
      // Only routine and security updates are free of hours; an update that breaks something uses them.
      if (/updates don't use/i.test(faq.answer)) expect(faq.answer, faq.question).toMatch(/routine and security updates don't use/i);
    }
  });
});
