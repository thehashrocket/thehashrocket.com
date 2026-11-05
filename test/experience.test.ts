import { describe, it, expect } from "vitest";
import { careerEntries, coreStack, domains } from "../lib/experience";
import { locationSlugs } from "../lib/locations";

describe("experience", () => {
  it("has at least one career entry", () => {
    expect(careerEntries.length).toBeGreaterThan(0);
  });

  it("entries are sorted newest first", () => {
    for (let i = 1; i < careerEntries.length; i++) {
      expect(careerEntries[i - 1].startYear).toBeGreaterThanOrEqual(
        careerEntries[i].startYear
      );
    }
  });

  it("each entry has required fields", () => {
    for (const entry of careerEntries) {
      expect(entry.description).toBeTruthy();
      expect(entry.role).toBeTruthy();
      expect(entry.startYear).toBeGreaterThanOrEqual(2000);
      expect(entry.technologies.length).toBeGreaterThan(0);
      expect(entry.location).toBeTruthy();
    }
  });

  it("dates are valid (startYear < endYear or endYear is null)", () => {
    for (const entry of careerEntries) {
      if (entry.endYear !== null) {
        expect(entry.endYear).toBeGreaterThan(entry.startYear);
      }
    }
  });

  it("locationSlug values reference valid slugs from locations.ts", () => {
    for (const entry of careerEntries) {
      if (entry.locationSlug) {
        expect(locationSlugs).toContain(entry.locationSlug);
      }
    }
  });

  it("core stack stays short enough to read as a choice", () => {
    expect(coreStack.length).toBeGreaterThan(0);
    expect(coreStack.length).toBeLessThanOrEqual(10);
  });

  it("domains array is non-empty", () => {
    expect(domains.length).toBeGreaterThan(0);
  });
});
