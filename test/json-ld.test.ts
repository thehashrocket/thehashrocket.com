import { describe, it, expect } from "vitest";
import { locationSlugs, getLocation } from "../lib/locations";

describe("LocationJsonLd data shape", () => {
  it("produces correct @type, url, and areaServed for each location", () => {
    for (const slug of locationSlugs) {
      const location = getLocation(slug)!;
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        url: `https://thehashrocket.com/locations/${slug}`,
        areaServed: {
          "@type": "City",
          name: location.name,
          containedInPlace: { "@type": "State", name: "California" },
        },
      };

      expect(jsonLd["@type"]).toBe("ProfessionalService");
      expect(jsonLd.url).toContain(slug);
      expect(jsonLd.areaServed["@type"]).toBe("City");
      expect(jsonLd.areaServed.name).toBe(location.name);
      expect(jsonLd.areaServed.containedInPlace["@type"]).toBe("State");
    }
  });
});

describe("FAQJsonLd data shape", () => {
  it("produces correct @type and mainEntity structure for each location", () => {
    for (const slug of locationSlugs) {
      const location = getLocation(slug)!;
      const mainEntity = location.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      }));

      expect(mainEntity.length).toBeGreaterThan(0);
      for (const entity of mainEntity) {
        expect(entity["@type"]).toBe("Question");
        expect(entity.name).toBeTruthy();
        expect(entity.acceptedAnswer["@type"]).toBe("Answer");
        expect(entity.acceptedAnswer.text).toBeTruthy();
      }
    }
  });
});
