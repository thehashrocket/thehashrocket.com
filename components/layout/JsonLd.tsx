import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
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
