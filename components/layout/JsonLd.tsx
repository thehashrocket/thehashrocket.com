export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jason Shultz",
    url: "https://thehashrocket.com",
    jobTitle: "Senior Full-Stack Engineer",
    description:
      "Senior full-stack engineer with 14 years specializing in complex systems, warehouse logistics, and AI pipelines.",
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
