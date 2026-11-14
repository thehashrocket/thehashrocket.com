import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PROJECT_TYPES,
  PROJECT_TYPE_BY_SOURCE,
  projectTypeForSource,
} from "../lib/contact-options";
import * as offers from "../lib/offers";
import {
  BUILD_PRICE_FLOOR,
  CARE_PLAN_MAX,
  CARE_PLAN_MIN,
  REVIEW_CREDIT_DAYS,
  REVIEW_CREDIT_TEXT,
  LOWEST_FIXED_PRICE,
  REVIEW_FRAMING,
  REVIEW_PRICE,
  SPRINT_PRICE_MAX,
  SPRINT_PRICE_MIN,
  capLine,
  formatReviewPrice,
  formatUsd,
  formatUsdCompact,
  formatUsdRange,
  indefiniteArticle,
  offerLadderParts,
  offerLadderText,
  reviewLineText,
} from "../lib/offers";
import { normalizeSource } from "../lib/sources";

describe("price formatting", () => {
  it("formats whole US dollars the same way everywhere", () => {
    expect(formatUsd(2500)).toBe("$2,500");
    expect(formatUsd(12345.6)).toBe("$12,346");
    expect(formatReviewPrice()).toBe(formatUsd(REVIEW_PRICE));
  });

  // Value: protects=ranges render "$a–$b" with an en dash and both dollar signs; fails_when=the separator or second "$" changes;
  //   why_new=new formatter; seam=none; no_claim=none beyond protects
  it("formats a range exactly and refuses an inverted or empty one", () => {
    expect(formatUsdRange(3500, 5000)).toBe("$3,500–$5,000"); // pregate-literal: REVIEW_PRICE=5000 formatter input, not the review price
    expect(() => formatUsdRange(5000, 5000)).toThrow(); // pregate-literal: REVIEW_PRICE=5000 formatter input, not the review price
    expect(() => formatUsdRange(600, 300)).toThrow();
  });

  it("formats compact amounts for badges", () => {
    expect(formatUsdCompact(3500)).toBe("$3.5K");
    expect(formatUsdCompact(10000)).toBe("$10K");
  });

  it("puts the cheapest fixed-price offer on the city badge", () => {
    expect([REVIEW_PRICE, SPRINT_PRICE_MIN]).toContain(LOWEST_FIXED_PRICE);
    expect(LOWEST_FIXED_PRICE).toBeLessThanOrEqual(REVIEW_PRICE);
    expect(LOWEST_FIXED_PRICE).toBeLessThanOrEqual(SPRINT_PRICE_MIN);
  });
});

describe("owner gate inputs", () => {
  // Value: protects=no offer ships with a missing, zero or NaN number; fails_when=a constant is deleted or set to 0;
  //   why_new=new constants; seam=none; no_claim=the owner's chosen values are right
  it("every numeric input is a positive number and every cap is null or positive", () => {
    const numeric = [
      "REVIEW_PRICE",
      "REVIEW_MAX_INTEGRATIONS",
      "REVIEW_CREDIT_DAYS",
      "SPRINT_PRICE_MIN",
      "SPRINT_PRICE_MAX",
      "SPRINT_MAX_SYSTEMS",
      "CARE_PLAN_MIN",
      "CARE_PLAN_MAX",
      "CARE_PLAN_HOURS",
      "BUILD_PRICE_FLOOR",
    ] as const;
    for (const key of numeric) {
      const value = offers[key];
      expect(Number.isFinite(value) && value > 0, key).toBe(true);
    }
    for (const key of ["REVIEW_MONTHLY_CAP", "SPRINT_MONTHLY_CAP", "CARE_PLAN_MAX_CLIENTS"] as const) {
      const value = offers[key];
      expect(value === null || (Number.isFinite(value) && value > 0), key).toBe(true);
    }
    expect(offers.REVIEW_TURNAROUND).toBeTruthy();
    expect(offers.SPRINT_WEEKS).toBeTruthy();
  });

  it("keeps the doors in order", () => {
    expect(SPRINT_PRICE_MIN).toBeLessThan(SPRINT_PRICE_MAX);
    expect(SPRINT_PRICE_MAX).toBeLessThan(BUILD_PRICE_FLOOR);
    expect(CARE_PLAN_MIN).toBeLessThan(CARE_PLAN_MAX);
    if (REVIEW_FRAMING === "small-door") expect(REVIEW_PRICE).toBeLessThan(SPRINT_PRICE_MAX);
  });

  it("hides a capacity line that is unset or not positive", () => {
    expect(capLine(null, "sprints")).toBeNull();
    expect(capLine(0, "sprints")).toBeNull();
    expect(capLine(2, "sprints")).toBe("I take 2 sprints a month. Ask about the next available start.");
  });

  // Value: protects=the published credit matches the term the owner approved; fails_when=the wording drops the sprint, cap or no-cash clause;
  //   why_new=terms changed at the gate; seam=none; no_claim=how credits are applied on invoices
  it("states the approved review credit", () => {
    expect(REVIEW_CREDIT_TEXT).toBe(
      `If you hire me for a fix or an automation sprint that starts within ${REVIEW_CREDIT_DAYS} days of the report, the review fee is credited toward it, up to that work's price. Unused credit isn't paid out.`,
    );
  });
});

describe("the pricing ladder", () => {
  const offerOrder = (framing: "small-door" | "premium") =>
    offerLadderParts(framing).flatMap((part) => (part.offer ? [part.offer] : []));

  // Value: protects=sprint, review, build order and the review's presence per framing; fails_when=segments reorder or the framing branch is ignored;
  //   why_new=new function; seam=none (framing is the production default argument); no_claim=which framing the owner picks
  it("orders offers by segment identity under both framings", () => {
    expect(offerOrder("small-door")).toEqual(["sprint", "review", "build"]);
    expect(offerOrder("premium")).toEqual(["sprint", "build"]);
  });

  it("joins the parts into the plain sentence for both framings", () => {
    for (const framing of ["small-door", "premium"] as const) {
      expect(offerLadderParts(framing).map((part) => part.text).join(""), framing).toBe(offerLadderText(framing));
    }
    expect(offerLadderText("small-door")).toBe(
      `Start with a ${formatUsdRange(SPRINT_PRICE_MIN, SPRINT_PRICE_MAX)} automation sprint or a ${formatReviewPrice()} AI-built app review. Larger builds start at ${formatUsd(BUILD_PRICE_FLOOR)}.`,
    );
    expect(offerLadderText("premium")).not.toContain("AI-built app review");
    expect(reviewLineText()).toContain(formatReviewPrice());
  });

  it("picks a or an by how the price is spoken", () => {
    for (const price of ["$1,500", "$3,500–$5,000", "$10,000", "$100"]) expect(indefiniteArticle(price), price).toBe("a");
    for (const price of ["$8,000", "$800", "$80,000", "$11,000", "$18,500"]) expect(indefiniteArticle(price), price).toBe("an");
  });

  it("links only to routes that exist in release 1", () => {
    const hrefs = offerLadderParts("small-door").flatMap((part) => (part.href ? [part.href] : []));
    expect(hrefs).toEqual(["/automation-sprint", "/ai-app-review"]);
  });
});

describe("module boundary", () => {
  // Value: protects=lib/offers.ts stays safe for client bundles; fails_when=it gains a value import (page copy, data modules);
  //   why_new=the boundary was a comment only; seam=none; no_claim=bundle size
  it("lib/offers.ts has no value imports", () => {
    const source = readFileSync("lib/offers.ts", "utf8");
    const imports = source.match(/^import .*$/gm) ?? [];
    for (const line of imports) expect(line, line).toMatch(/^import type /);
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
    expect(projectTypeForSource("automation-sprint")).toBe("Automation sprint");
    expect(projectTypeForSource("care-plan")).toBe("Ongoing support");
    expect(projectTypeForSource("talks")).toBeUndefined();
    expect(projectTypeForSource(undefined)).toBeUndefined();
    expect(projectTypeForSource("home")).toBeUndefined();
    expect(projectTypeForSource("constructor")).toBeUndefined();
  });

  it("lists the sprint right after new builds", () => {
    expect(PROJECT_TYPES.indexOf("Automation sprint")).toBe(PROJECT_TYPES.indexOf("New build") + 1);
  });
});
