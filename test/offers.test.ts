import { describe, expect, it } from "vitest";
import {
  PROJECT_TYPES,
  PROJECT_TYPE_BY_SOURCE,
  projectTypeForSource,
} from "../lib/contact-options";
import { REVIEW_PRICE, formatReviewPrice, formatUsd } from "../lib/offers";
import { normalizeSource } from "../lib/sources";

describe("review pricing", () => {
  it("formats whole US dollars the same way everywhere", () => {
    expect(formatUsd(2500)).toBe("$2,500");
    expect(formatUsd(12345.6)).toBe("$12,346");
    expect(formatReviewPrice()).toBe(formatUsd(REVIEW_PRICE));
  });
});

describe("project type by source", () => {
  it("maps only sources the site emits, to project types the server accepts", () => {
    for (const [source, projectType] of Object.entries(PROJECT_TYPE_BY_SOURCE)) {
      expect(normalizeSource(source), source).toBe(source);
      expect(PROJECT_TYPES).toContain(projectType);
    }
  });

  it("returns nothing for unknown or inherited keys", () => {
    expect(projectTypeForSource("ai-app-review")).toBe("AI-built app review");
    expect(projectTypeForSource(undefined)).toBeUndefined();
    expect(projectTypeForSource("home")).toBeUndefined();
    expect(projectTypeForSource("constructor")).toBeUndefined();
  });
});
