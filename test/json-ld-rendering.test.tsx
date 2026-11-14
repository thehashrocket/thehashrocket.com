/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import React from "react";
import { PERSON_ID, PersonJsonLd, ServiceJsonLd, WebSiteJsonLd } from "../components/layout/JsonLd";
import { LocationJsonLd, FAQJsonLd } from "../components/layout/LocationJsonLd";
import { getLocation } from "../lib/locations";

function parseJsonLdScript(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  return JSON.parse(script!.textContent!);
}

describe("PersonJsonLd rendering", () => {
  it("renders a script tag with valid JSON-LD", () => {
    const { container } = render(<PersonJsonLd />);
    const data = parseJsonLdScript(container);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Jason Shultz");
    expect(data.url).toBe("https://www.jasonshultz.com");
    expect(data.jobTitle).toBe("Senior Full-Stack Engineer");
    expect(data.sameAs).toContain("https://www.linkedin.com/in/jasonshultz/");
    expect(data.sameAs).toContain("https://github.com/thehashrocket");
  });

  // Value: protects=the site-wide Person carries the @id that ServiceJsonLd's provider points at, so the offer resolves to a provider;
  //   fails_when=the Person loses its @id or the Service provider stops referencing PERSON_ID;
  //   why_new=offer-pages checks the provider's literal @id only; nothing checks the Person node declares it;
  //   seam=none; no_claim=Google's structured-data validator accepting the graph
  it("declares the @id that ServiceJsonLd's provider references", () => {
    const person = parseJsonLdScript(render(<PersonJsonLd />).container);
    const service = parseJsonLdScript(
      render(<ServiceJsonLd name="x" description="y" url="https://www.jasonshultz.com/x" price={1} />).container,
    );
    expect(person["@id"]).toBe(PERSON_ID);
    expect(service.provider).toEqual({ "@id": person["@id"] });
  });
});

describe("WebSiteJsonLd rendering", () => {
  it("renders a script tag with valid JSON-LD", () => {
    const { container } = render(<WebSiteJsonLd />);
    const data = parseJsonLdScript(container);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBeTruthy();
    expect(data.url).toBe("https://www.jasonshultz.com");
  });
});

describe("LocationJsonLd rendering", () => {
  const location = getLocation("sacramento")!;

  it("renders valid ProfessionalService JSON-LD", () => {
    const { container } = render(
      <LocationJsonLd location={location} slug="sacramento" />
    );
    const data = parseJsonLdScript(container);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("ProfessionalService");
    expect(data.url).toBe("https://www.jasonshultz.com/locations/sacramento");
    expect(data.description).toBe(location.metaDescription);
  });

  it("lists each city when a page covers several", () => {
    const location = getLocation("manteca-tracy-lathrop")!;
    const { container } = render(
      React.createElement(LocationJsonLd, { location, slug: location.slug }),
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script!.innerHTML);
    expect(data.areaServed.map((c: { name: string }) => c.name)).toEqual(["Manteca", "Tracy", "Lathrop"]);
  });

  it("includes areaServed with city and state", () => {
    const { container } = render(
      <LocationJsonLd location={location} slug="sacramento" />
    );
    const data = parseJsonLdScript(container);
    expect(data.areaServed["@type"]).toBe("City");
    expect(data.areaServed.name).toBe(location.name);
    expect(data.areaServed.containedInPlace["@type"]).toBe("State");
    expect(data.areaServed.containedInPlace.name).toBe("California");
  });

  it("includes provider, serviceType, and priceRange", () => {
    const { container } = render(
      <LocationJsonLd location={location} slug="sacramento" />
    );
    const data = parseJsonLdScript(container);
    expect(data.provider["@type"]).toBe("Person");
    expect(data.provider.name).toBe("Jason Shultz");
    expect(data.serviceType).toBe("Software Engineering");
    expect(data.priceRange).toBeTruthy();
  });
});

describe("FAQJsonLd rendering", () => {
  const location = getLocation("sacramento")!;

  it("renders valid FAQPage JSON-LD", () => {
    const { container } = render(<FAQJsonLd faqs={location.faqs} />);
    const data = parseJsonLdScript(container);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity.length).toBeGreaterThan(0);
  });

  it("each question has correct structure", () => {
    const { container } = render(<FAQJsonLd faqs={location.faqs} />);
    const data = parseJsonLdScript(container);
    for (const entity of data.mainEntity) {
      expect(entity["@type"]).toBe("Question");
      expect(entity.name).toBeTruthy();
      expect(entity.acceptedAnswer["@type"]).toBe("Answer");
      expect(entity.acceptedAnswer.text).toBeTruthy();
    }
  });
});
