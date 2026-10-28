export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jason Shultz",
    url: "https://thehashrocket.com",
    jobTitle: "Senior Full-Stack Engineer",
    description:
      "Senior full-stack engineer with 20+ years specializing in custom web applications, legacy platform modernization, and the infrastructure that keeps them running.",
    sameAs: [
      "https://www.linkedin.com/in/jasonshultz/",
      "https://github.com/thehashrocket",
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
    url: "https://thehashrocket.com",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
