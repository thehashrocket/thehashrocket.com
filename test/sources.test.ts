// Value: protects=every source value the site emits survives normalizeSource and anything else is dropped;
//   fails_when=a slug or the work- prefix drifts from KNOWN_SOURCES, or the string/allowlist guard is loosened;
//   why_new=actions.test.ts sends one known and one unknown string only, never arrays or the full emitted set;
//   seam=none; no_claim=call sites really pass these values (the emitted list is restated here)
import { describe, expect, it } from "vitest";
import { caseStudySlugs } from "../lib/case-studies";
import { locationSlugs } from "../lib/locations";
import { normalizeSource } from "../lib/sources";

describe("normalizeSource", () => {
  it("keeps every source the site emits and drops everything else", () => {
    const emitted = [
      "home",
      "work",
      "about",
      "locations",
      "ai-app-review",
      "print-shops",
      "linkedin",
      "referral",
      ...locationSlugs,
      ...caseStudySlugs.map((slug) => `work-${slug}`),
    ];
    for (const source of emitted) expect(normalizeSource(source), source).toBe(source);

    // A repeated ?source=a&source=b arrives as an array
    const rejected = [undefined, null, 7, ["home", "work"], "", "HOME", "work-nope", "constructor", "home\r\nBcc: x"];
    for (const value of rejected) expect(normalizeSource(value)).toBeUndefined();
  });
});
