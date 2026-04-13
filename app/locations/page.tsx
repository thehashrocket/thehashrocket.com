import type { Metadata } from "next";
import Link from "next/link";
import { getAllLocations } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Locations",
  description:
    "Senior full-stack engineer serving Sacramento, Stockton, and Modesto. Local software engineering for Central Valley businesses.",
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
          14 years of engineering complex systems. Based in California&apos;s
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
                {location.industries.join(" / ")}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-24 border-t border-[var(--border)] pt-16">
          <h2 className="mb-6 font-display text-3xl font-bold text-[var(--text-primary)]">
            Don&apos;t see your area?
          </h2>
          <p className="mb-8 max-w-xl text-lg text-[var(--text-secondary)]">
            I work with businesses across California. If you have a complex
            software challenge, let&apos;s talk.
          </p>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-8 py-3 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
}
