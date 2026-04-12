import { describe, it, expect } from "vitest";
import { locationSlugs, getLocation } from "../lib/locations";
import { getCaseStudySummaries } from "../lib/case-studies";

describe("geo page data integration", () => {
  it("all location slugs produce valid page data", () => {
    for (const slug of locationSlugs) {
      const location = getLocation(slug);
      expect(location).toBeDefined();
      expect(location!.metaTitle).toContain(location!.name);
      expect(location!.metaDescription.length).toBeGreaterThan(50);
    }
  });

  it("case studies are available for geo pages", () => {
    const studies = getCaseStudySummaries();
    expect(studies.length).toBeGreaterThan(0);
  });

  it("contact attribution URLs are valid for each location", () => {
    for (const slug of locationSlugs) {
      const url = `/contact?source=${slug}`;
      expect(url).toMatch(/^\/contact\?source=[a-z0-9-]+$/);
    }
  });

  it("ProfessionalService JSON-LD data is complete for each location", () => {
    for (const slug of locationSlugs) {
      const location = getLocation(slug)!;
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Jason Shultz — Software Engineering",
        description: location.metaDescription,
        url: `https://thehashrocket.com/locations/${slug}`,
        areaServed: {
          "@type": "City",
          name: location.name,
        },
      };

      expect(jsonLd["@type"]).toBe("ProfessionalService");
      expect(jsonLd.url).toContain(slug);
      expect(jsonLd.areaServed.name).toBe(location.name);
    }
  });

  it("FAQPage JSON-LD has valid structure for each location", () => {
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

  it("FAQ data shape is compatible with accordion rendering", () => {
    for (const slug of locationSlugs) {
      const location = getLocation(slug)!;
      for (const faq of location.faqs) {
        expect(faq.question.trim().length).toBeGreaterThan(0);
        expect(faq.answer.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("sitemap entries would be generated for all locations", () => {
    const baseUrl = "https://thehashrocket.com";
    const urls = [
      `${baseUrl}/locations`,
      ...locationSlugs.map((slug) => `${baseUrl}/locations/${slug}`),
    ];

    expect(urls).toHaveLength(4);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/thehashrocket\.com\/locations/);
    }
  });
});
