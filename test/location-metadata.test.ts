import { describe, it, expect } from "vitest";
import { generateMetadata, generateStaticParams } from "../app/locations/[slug]/page";
import { locationSlugs } from "../lib/locations";

describe("location page generateStaticParams", () => {
  it("returns all location slugs", async () => {
    const params = await generateStaticParams();
    const slugs = params.map((p) => p.slug);
    for (const slug of locationSlugs) {
      expect(slugs).toContain(slug);
    }
  });
});

describe("location page generateMetadata", () => {
  it("returns metadata for a valid slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "sacramento" }),
    });
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect((meta.openGraph as { type?: string })?.type).toBe("website");
  });

  it("returns empty object for an unknown slug", async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "nonexistent-city-xyz" }),
    });
    expect(meta).toEqual({});
  });

  it("each valid location slug produces distinct metadata", async () => {
    const results = await Promise.all(
      locationSlugs.map((slug) =>
        generateMetadata({ params: Promise.resolve({ slug }) })
      )
    );
    const titles = results.map((m) => m.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });
});
