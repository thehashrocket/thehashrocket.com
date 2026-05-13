import { describe, it, expect } from "vitest";
import {
  caseStudies,
  caseStudySlugs,
  getCaseStudySummaries,
} from "../lib/case-studies";

describe("case-studies", () => {
  it("exports 4 case studies", () => {
    expect(caseStudySlugs).toHaveLength(4);
  });

  it("has pharma-wms, nonprofit-matching, grant-discovery, print-portal", () => {
    expect(caseStudySlugs).toContain("pharma-wms");
    expect(caseStudySlugs).toContain("nonprofit-matching");
    expect(caseStudySlugs).toContain("grant-discovery");
    expect(caseStudySlugs).toContain("print-portal");
  });

  it("each case study has required fields", () => {
    for (const slug of caseStudySlugs) {
      const study = caseStudies[slug];
      expect(study.slug).toBe(slug);
      expect(study.title).toBeTruthy();
      expect(study.subtitle).toBeTruthy();
      expect(study.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(study.tags.length).toBeGreaterThan(0);
      expect(study.beats.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each beat has heading and body", () => {
    for (const slug of caseStudySlugs) {
      for (const beat of caseStudies[slug].beats) {
        expect(beat.heading).toBeTruthy();
        expect(beat.body).toBeTruthy();
      }
    }
  });

  it("getCaseStudySummaries returns summaries without beats", () => {
    const summaries = getCaseStudySummaries();
    expect(summaries).toHaveLength(4);
    for (const summary of summaries) {
      expect(summary.slug).toBeTruthy();
      expect(summary.title).toBeTruthy();
      expect(summary.subtitle).toBeTruthy();
      expect(summary.accent).toBeTruthy();
      expect(summary.tags.length).toBeGreaterThan(0);
      expect((summary as unknown as Record<string, unknown>).beats).toBeUndefined();
    }
  });

  it("slugs are URL-safe", () => {
    for (const slug of caseStudySlugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
