import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocation, getAllLocations, locationSlugs } from "@/lib/locations";
import { LocationJsonLd, FAQJsonLd } from "@/components/layout/LocationJsonLd";
import { HeroSection } from "@/components/ui/geo/HeroSection";
import { ServicesSection } from "@/components/ui/geo/ServicesSection";
import { CaseStudiesSection } from "@/components/ui/geo/CaseStudiesSection";
import { FAQSection } from "@/components/ui/geo/FAQSection";
import { CTASection } from "@/components/ui/geo/CTASection";

export const dynamicParams = false;

type PageParams = { slug: string };

export async function generateStaticParams() {
  return locationSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};

  return {
    title: location.metaTitle,
    description: location.metaDescription,
    openGraph: {
      title: location.metaTitle,
      description: location.metaDescription,
      type: "website",
      url: `https://thehashrocket.com/locations/${slug}`,
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const location = getLocation(slug);

  if (!location) notFound();

  const nearbyLocations = getAllLocations().filter((l) => l.slug !== slug);

  return (
    <div className="relative">
      <LocationJsonLd location={location} slug={slug} />
      <FAQJsonLd faqs={location.faqs} />
      <HeroSection location={location} />
      <ServicesSection location={location} />
      <CaseStudiesSection location={location} />
      <FAQSection key={slug} faqs={location.faqs} />
      <CTASection location={location} />

      {/* Nearby locations */}
      {nearbyLocations.length >= 2 && (
        <div className="px-6 pb-12">
          <div className="mx-auto max-w-[1280px]">
            <p className="text-sm text-[var(--text-muted)]">
              Also serving:{" "}
              {nearbyLocations.map((loc, i) => (
                <span key={loc.slug}>
                  {i > 0 && " · "}
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="transition-colors hover:text-[var(--text-primary)]"
                  >
                    {loc.name}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
