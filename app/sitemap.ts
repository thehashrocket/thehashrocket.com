import type { MetadataRoute } from "next";
import { locationSlugs } from "@/lib/locations";
import { caseStudySlugs } from "@/lib/case-studies";
import { OFFER_ROUTES, OFFER_ROUTE_UPDATED } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.jasonshultz.com";

  const caseStudyEntries: MetadataRoute.Sitemap = caseStudySlugs.map((slug) => ({
    url: `${baseUrl}/work/${slug}`,
    lastModified: "2024-06-01",
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const locationEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/locations`, lastModified: "2025-01-01", changeFrequency: "monthly", priority: 0.8 },
    ...locationSlugs.map((slug) => ({
      url: `${baseUrl}/locations/${slug}`,
      lastModified: "2025-01-01",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  const offerEntries: MetadataRoute.Sitemap = OFFER_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: OFFER_ROUTE_UPDATED[route],
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: "2025-01-01", changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/work`, lastModified: "2025-01-01", changeFrequency: "monthly", priority: 0.8 },
    ...caseStudyEntries,
    ...locationEntries,
    { url: `${baseUrl}/about`, lastModified: "2025-01-01", changeFrequency: "monthly", priority: 0.6 },
    ...offerEntries,
    { url: `${baseUrl}/lab`, lastModified: "2026-11-04", changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: "2025-01-01", changeFrequency: "yearly", priority: 0.5 },
  ];
}
