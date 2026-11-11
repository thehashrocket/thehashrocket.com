import type { Location, FAQ } from "@/lib/locations";

function city(name: string) {
  return {
    "@type": "City",
    name,
    containedInPlace: {
      "@type": "State",
      name: "California",
    },
  };
}

export function LocationJsonLd({ location, slug }: { location: Location; slug: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Jason Shultz — Software Engineering",
    description: location.metaDescription,
    url: `https://www.jasonshultz.com/locations/${slug}`,
    areaServed: location.cities?.map(city) ?? city(location.name),
    provider: {
      "@type": "Person",
      name: "Jason Shultz",
      jobTitle: "Senior Full-Stack Engineer",
      url: "https://www.jasonshultz.com",
    },
    serviceType: "Software Engineering",
    priceRange: "$$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd({ faqs }: { faqs: FAQ[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
