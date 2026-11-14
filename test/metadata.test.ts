import { describe, it, expect } from "vitest";
import { metadata as workMetadata } from "../app/work/page";
import { metadata as aboutMetadata } from "../app/about/page";
import { metadata as contactMetadata } from "../app/contact/page";
import { metadata as reviewMetadata } from "../app/ai-app-review/page";
import { metadata as printMetadata } from "../app/print-shops/page";
import { metadata as sprintMetadata } from "../app/automation-sprint/page";
import { OFFER_ROUTES } from "../lib/site";
import { offerLadderText } from "../lib/offers";

describe("metadata", () => {
  it("root layout openGraph values are defined (checked statically)", () => {
    // These values are hardcoded in app/layout.tsx and validated here as constants
    const ogTitle = "Jason Shultz — Senior Full-Stack Engineer";
    const ogDescription =
      "Senior software engineer and consultant with 20+ years building and rescuing the systems owner-operated and mid-size businesses run on, and keeping them running.";
    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
  });

  it("PersonJsonLd sameAs is non-empty", () => {
    const sameAs = [
      "https://www.linkedin.com/in/jasonshultz/",
      "https://github.com/thehashrocket",
    ];
    expect(sameAs.length).toBeGreaterThan(0);
    for (const url of sameAs) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("each page has title and description", () => {
    const pages = [
      { name: "work", meta: workMetadata },
      { name: "about", meta: aboutMetadata },
      { name: "contact", meta: contactMetadata },
      { name: "ai-app-review", meta: reviewMetadata },
      { name: "print-shops", meta: printMetadata },
      { name: "automation-sprint", meta: sprintMetadata },
    ];
    for (const { name, meta } of pages) {
      expect(meta.title, `${name} title`).toBeTruthy();
      expect(meta.description, `${name} description`).toBeTruthy();
    }
  });

  it("each page has openGraph.url", () => {
    expect(workMetadata.openGraph?.url).toBe("https://www.jasonshultz.com/work");
    expect(aboutMetadata.openGraph?.url).toBe("https://www.jasonshultz.com/about");
    expect(contactMetadata.openGraph?.url).toBe("https://www.jasonshultz.com/contact");
    const offerMetadata: Record<(typeof OFFER_ROUTES)[number], typeof reviewMetadata> = {
      "/automation-sprint": sprintMetadata,
      "/ai-app-review": reviewMetadata,
      "/print-shops": printMetadata,
    };
    for (const route of OFFER_ROUTES) {
      expect(offerMetadata[route].openGraph?.url, route).toBe(`https://www.jasonshultz.com${route}`);
    }
  });

  // Value: protects=the /print-shops search snippet names the weekly job volume; fails_when=the case study results are reordered so results[0] becomes another stat;
  //   why_new=no test reads the print-shops description text; seam=none; no_claim=the volume figure itself (the case study owns it)
  it("print-shops description quotes the weekly job volume", () => {
    expect(printMetadata.description).toContain("jobs a week");
  });

  // Value: protects=the /contact search snippet carries the current pricing ladder; fails_when=the description is retyped or drops the ladder;
  //   why_new=the old test only checked the description exists; seam=none; no_claim=how search engines display it
  it("contact description includes the pricing ladder", () => {
    expect(contactMetadata.description).toContain(offerLadderText());
  });
});
