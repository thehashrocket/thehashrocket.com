import type { Metadata } from "next";
import Link from "next/link";
import { ClosingCta } from "@/components/ui/ClosingCta";
import { getAllLocations } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Senior full-stack engineer serving Sacramento, Stockton, Modesto, Manteca, Tracy, and Lathrop. Local software engineering for Central Valley businesses.",
};

export default function LocationsPage() {
  const locations = getAllLocations();

  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-[1280px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">
          Central Valley
        </p>
        <h1 className="mb-6 max-w-3xl font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl">
          Software engineering,
          <br />
          built locally.
        </h1>
        <p className="mb-16 max-w-xl text-xl text-[var(--text-secondary)]">
          20+ years of engineering complex systems. Based in California&apos;s
          Central Valley, serving businesses across the region.
        </p>

        <div className="flex flex-col gap-6">
          {locations.map((location, i) => (
            <Link
              key={location.slug}
              href={`/locations/${location.slug}`}
              className={`group rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 transition-colors hover:border-[var(--accent)] ${
                i === 0
                  ? "md:w-3/4"
                  : i === 1
                    ? "md:ml-auto md:w-2/3"
                    : "md:w-1/2"
              }`}
            >
              <p className="mb-1 font-mono text-xs text-[var(--accent)]">
                {location.region}
              </p>
              <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">
                {location.name}
              </h2>
              <p className="mt-2 text-[var(--text-secondary)]">
                {location.industries.map((industry) => industry.name).join(" / ")}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-24 border-t border-[var(--border)] pt-16">
          <ClosingCta
            heading="Don't see your area?"
            body="I'm based in the Central Valley and work remotely too. Tell me what you're dealing with."
            source="locations"
          />
        </div>
      </div>
    </div>
  );
}
