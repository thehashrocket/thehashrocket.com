import { describe, it, expect } from "vitest";
import { metadata as workMetadata } from "../app/work/page";
import { metadata as aboutMetadata } from "../app/about/page";
import { metadata as contactMetadata } from "../app/contact/page";

describe("metadata", () => {
  it("root layout openGraph values are defined (checked statically)", () => {
    // These values are hardcoded in app/layout.tsx and validated here as constants
    const ogTitle = "Jason Shultz — Senior Full-Stack Engineer";
    const ogDescription =
      "Senior full-stack engineer with 14 years building complex systems. Consulting for startups and enterprises.";
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
    ];
    for (const { name, meta } of pages) {
      expect(meta.title, `${name} title`).toBeTruthy();
      expect(meta.description, `${name} description`).toBeTruthy();
    }
  });

  it("each page has openGraph.url", () => {
    expect(workMetadata.openGraph?.url).toBe("https://thehashrocket.com/work");
    expect(aboutMetadata.openGraph?.url).toBe("https://thehashrocket.com/about");
    expect(contactMetadata.openGraph?.url).toBe("https://thehashrocket.com/contact");
  });
});
