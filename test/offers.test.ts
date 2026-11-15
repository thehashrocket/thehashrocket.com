import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PROJECT_TYPES,
  PROJECT_TYPE_BY_SOURCE,
  contactFlowFor,
  flowKindFor,
  projectTypeForSource,
  type ProjectType,
} from "../lib/contact-options";
import * as offers from "../lib/offers";
import {
  BUILD_PRICE_FLOOR,
  CARE_PLAN_MAX,
  CARE_PLAN_MAX_CLIENTS,
  CARE_PLAN_MIN,
  REVIEW_CREDIT_DAYS,
  REVIEW_CREDIT_TEXT,
  LOWEST_FIXED_PRICE,
  REVIEW_FRAMING,
  REVIEW_MONTHLY_CAP,
  REVIEW_PRICE,
  SPRINT_MONTHLY_CAP,
  SPRINT_PRICE_MAX,
  SPRINT_PRICE_MIN,
  capLine,
  clientCapLine,
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
import { reviewLocalLine, sprintLocalLine, talkFormat } from "../lib/offer-content";

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
      "CARE_PLAN_MAX_HOURS",
      "CARE_PLAN_MAX_SYSTEMS",
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
    // Value: protects=the care tiers stay coherent: more systems buys more hours, and the second tier reads "2–N systems";
    //   fails_when=CARE_PLAN_HOURS reaches CARE_PLAN_MAX_HOURS (formatCareHours throws on every page) or
    //   CARE_PLAN_MAX_SYSTEMS drops below 2 ("2–1 systems"); why_new=render tests only fail on the throw, by stack trace,
    //   and never on the tier label; seam=none; no_claim=the owner's chosen hours and system counts are right
    expect(offers.CARE_PLAN_HOURS).toBeLessThan(offers.CARE_PLAN_MAX_HOURS);
    expect(offers.formatCareHours()).toBe(`${offers.CARE_PLAN_HOURS}–${offers.CARE_PLAN_MAX_HOURS}`);
    expect(offers.CARE_PLAN_MAX_SYSTEMS).toBeGreaterThanOrEqual(2);
    if (REVIEW_FRAMING === "small-door") expect(REVIEW_PRICE).toBeLessThan(SPRINT_PRICE_MAX);
  });

  // Value: protects=a cap of 1 reads "1 sprint", not "1 sprints", and unset or zero caps hide the line;
  //   fails_when=capLine goes back to one unit form; why_new=#101 lowers the sprint cap to 1; seam=none;
  //   no_claim=none beyond protects
  it("words the capacity line for one and many, and hides it when unset or not positive", () => {
    expect(capLine(null, "sprint", "sprints")).toBeNull();
    expect(capLine(0, "sprint", "sprints")).toBeNull();
    expect(capLine(1, "sprint", "sprints")).toBe("I take 1 sprint a month. Ask about the next available start.");
    expect(capLine(2, "review", "reviews")).toBe("I take 2 reviews a month. Ask about the next available start.");
  });

  // Value: protects=the care plan's standing client cap reads as a total, not "a month", and hides like capLine;
  //   fails_when=clientCapLine reuses capLine's monthly wording or shows a zero cap; why_new=new helper; seam=none;
  //   no_claim=none beyond protects
  it("words the care-plan client cap as a total and hides it when unset or not positive", () => {
    expect(clientCapLine(null)).toBeNull();
    expect(clientCapLine(0)).toBeNull();
    expect(clientCapLine(1)).toBe("I take on up to 1 care-plan client. Ask about the next opening.");
    expect(clientCapLine(10)).toBe("I take on up to 10 care-plan clients. Ask about the next opening."); // pregate-literal: CARE_PLAN_MAX_CLIENTS=10 a deliberate plural input, independent of the live cap
  });

  // Value: protects=the published caps match #101 (1 sprint, 2 reviews); fails_when=a cap is raised without
  //   the hours data; why_new=#101; seam=none; no_claim=actual delivery hours
  it("publishes the #101 caps", () => {
    expect(SPRINT_MONTHLY_CAP).toBe(1);
    expect(REVIEW_MONTHLY_CAP).toBe(2);
    // uc3b: 5 clients × (included hours + 0.5–1 hour of updates), no separate incident buffer (docs/DOMAIN.md).
    expect(CARE_PLAN_MAX_CLIENTS).toBe(5);
  });

  // Value: protects=the published credit matches the term the owner approved; fails_when=the wording drops the sprint, cap or no-cash clause;
  //   why_new=terms changed at the gate; seam=none; no_claim=how credits are applied on invoices
  it("states the approved review credit", () => {
    expect(REVIEW_CREDIT_TEXT).toBe(
      `If you sign a scope for a fix or an automation sprint within ${REVIEW_CREDIT_DAYS} days of the report, the review fee is credited toward it, up to that work's price. The work can start later. Unused credit isn't paid out.`,
    );
  });
});

describe("the pricing ladder", () => {
  const offerOrder = (framing: "small-door" | "premium") =>
    offerLadderParts(framing).flatMap((part) => (part.offer ? [part.offer] : []));

  // Value: protects=sprint, review, build, care order and the review's presence per framing; fails_when=segments reorder or the framing branch is ignored;
  //   why_new=new function; seam=none (framing is the production default argument); no_claim=which framing the owner picks
  it("orders offers by segment identity under both framings", () => {
    expect(offerOrder("small-door")).toEqual(["sprint", "review", "build", "care"]);
    expect(offerOrder("premium")).toEqual(["sprint", "build", "care"]);
  });

  it("joins the parts into the plain sentence for both framings", () => {
    for (const framing of ["small-door", "premium"] as const) {
      expect(offerLadderParts(framing).map((part) => part.text).join(""), framing).toBe(offerLadderText(framing));
    }
    expect(offerLadderText("small-door")).toBe(
      `Start with a ${formatUsdRange(SPRINT_PRICE_MIN, SPRINT_PRICE_MAX)} automation sprint or a ${formatReviewPrice()} AI-built app review. Larger builds start at ${formatUsd(BUILD_PRICE_FLOOR)}. Keep it running for ${formatUsdRange(CARE_PLAN_MIN, CARE_PLAN_MAX)} a month.`,
    );
    expect(offerLadderText("premium")).not.toContain("AI-built app review");
    expect(reviewLineText()).toContain(formatReviewPrice());
  });

  it("picks a or an by how the price is spoken", () => {
    for (const price of ["$1,500", "$3,500–$5,000", "$10,000", "$100"]) expect(indefiniteArticle(price), price).toBe("a"); // pregate-literal: CARE_PLAN_MAX_CLIENTS=10 the 10 is a sample price, not the care cap
    for (const price of ["$8,000", "$800", "$80,000", "$11,000", "$18,500"]) expect(indefiniteArticle(price), price).toBe("an");
  });

  it("links each priced offer to its page", () => {
    const hrefs = offerLadderParts("small-door").flatMap((part) => (part.href ? [part.href] : []));
    expect(hrefs).toEqual(["/automation-sprint", "/ai-app-review", "/care-plan"]);
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
    expect(projectTypeForSource("talks")).toBe("A talk for my group");
    expect(projectTypeForSource(undefined)).toBeUndefined();
    expect(projectTypeForSource("home")).toBeUndefined();
    expect(projectTypeForSource("constructor")).toBeUndefined();
  });

  it("lists the sprint right after new builds", () => {
    expect(PROJECT_TYPES.indexOf("Automation sprint")).toBe(PROJECT_TYPES.indexOf("New build") + 1);
  });
});

// Value: protects=every project-type option leads to the "What happens next" it was meant to (#106);
//   fails_when=a new option is added without choosing a flow, or the sprint/review rows fall through to generic;
//   why_new=sprint and review get their own steps; seam=none; no_claim=the wording of each step (owner copy)
describe("contact flows by project type", () => {
  function intendedFlow(type: ProjectType) {
    switch (type) {
      case "Automation sprint":
        return "sprint";
      case "AI-built app review":
        return "review";
      case "A talk for my group":
        return "talk";
      case "New build":
      case "Rescue":
      case "Ongoing support":
      case "Not sure":
        return "generic";
      default: {
        const unhandled: never = type;
        throw new Error(`No intended flow for ${String(unhandled)}`);
      }
    }
  }

  it("maps every option to its intended flow", () => {
    for (const type of PROJECT_TYPES) expect(flowKindFor(type), type).toBe(intendedFlow(type));
    expect(flowKindFor("")).toBe("generic");
    expect(flowKindFor("constructor")).toBe("generic");
  });

  it("gives the sprint and the review their own steps, with a timeline and no note", () => {
    const sprint = contactFlowFor("Automation sprint");
    expect(sprint.nextSteps.join(" ")).toMatch(/one-page scope with a fixed price and one success metric/);
    const review = contactFlowFor("AI-built app review");
    expect(review.nextSteps.join(" ")).toMatch(/30-minute walkthrough/);
    for (const flow of [sprint, review]) {
      expect(flow.showTimeline).toBe(true);
      expect(flow.note).toBeUndefined();
    }
  });
});

// Value: protects=the offer heroes' local lines stay the short approved copy (so the hero fits a 375x560
//   phone) and still say where I work; the talk format keeps the three cities;
//   fails_when=a local line drops "Central Valley" or grows back into the long city list, or a city leaves
//   talkFormat; why_new=owner-approved shorter copy (d7a) moved the cities off the offer heroes; seam=none;
//   no_claim=whether the owner actually travels there (owner-confirmed copy)
describe("local and reachable lines", () => {
  it("keeps the three cities on the talk format", () => {
    const cities = /In person in the (.+) areas/.exec(talkFormat)![1].split(/, | and /);
    expect(cities).toEqual(["Sacramento", "Stockton", "Modesto"]);
  });

  it("says Central Valley on both offer heroes, in the short approved copy", () => {
    for (const line of [sprintLocalLine, reviewLocalLine]) {
      expect(line).toContain("Central Valley");
      expect(line.length).toBeLessThanOrEqual(70);
    }
  });

  it("never claims nobody else offers this", () => {
    for (const line of [sprintLocalLine, reviewLocalLine]) expect(line).not.toMatch(/nobody else|only one|no one else/i);
  });
});
