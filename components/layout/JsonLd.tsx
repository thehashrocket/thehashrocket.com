import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

export const PERSON_ID = "https://www.jasonshultz.com/#person";

export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Jason Shultz",
    url: "https://www.jasonshultz.com",
    jobTitle: "Senior Full-Stack Engineer",
    description:
      "Senior software engineer and consultant with 20+ years building and rescuing the systems owner-operated and mid-size businesses run on, and keeping them running.",
    sameAs: [
      LINKEDIN_URL,
      GITHUB_URL,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Jason Shultz — Senior Full-Stack Engineer",
    url: "https://www.jasonshultz.com",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/** How a service is priced. */
export type ServiceOffer =
  | { kind: "fixed"; price: number }
  | { kind: "range"; low: number; high: number }
  | { kind: "monthly"; low: number; high: number };

interface ServiceJsonLdProps {
  name: string;
  description: string;
  url: string;
  offer: ServiceOffer;
}

function offerJsonLd(offer: ServiceOffer) {
  switch (offer.kind) {
    case "fixed":
      return { "@type": "Offer", price: offer.price, priceCurrency: "USD" };
    case "range":
      return { "@type": "AggregateOffer", lowPrice: offer.low, highPrice: offer.high, priceCurrency: "USD" };
    case "monthly":
      return {
        "@type": "Offer",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          minPrice: offer.low,
          maxPrice: offer.high,
          priceCurrency: "USD",
          unitCode: "MON",
        },
      };
  }
}

/** A priced service, attributed to the site-wide Person by @id. */
export function ServiceJsonLd({ name, description, url, offer }: ServiceJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: { "@id": PERSON_ID },
    areaServed: "US",
    offers: offerJsonLd(offer),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
