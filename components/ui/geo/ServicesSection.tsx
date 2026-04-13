import type { Location } from "@/lib/locations";

export function ServicesSection({ location }: { location: Location }) {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">
          Local Proof
        </p>
        <h2 className="mb-12 font-display text-[32px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          {location.name}&apos;s Tech Landscape
        </h2>

        {/* 60/40 asymmetric layout */}
        <div className="grid gap-12 md:grid-cols-[3fr_2fr]">
          {/* Left column: economic context */}
          <div className="max-w-[720px]">
            <p className="text-base leading-relaxed text-[var(--text-secondary)]">
              {location.economicContext}
            </p>
            <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8">
              <h3 className="mb-3 font-display text-xl font-semibold text-[var(--text-primary)]">
                Why a local engineer?
              </h3>
              <p className="text-[var(--text-secondary)]">
                {location.whyLocal}
              </p>
              {location.localExperience && (
                <div className="mt-6 border-l-2 border-[var(--accent)] pl-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {location.localExperience}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: industry relevance */}
          <div className="flex flex-col gap-4">
            {location.industries.map((industry) => (
              <div key={industry} className="border-l-2 border-[var(--accent)] pl-4">
                <p className="font-mono text-xs text-[var(--accent)]">Industry</p>
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  {industry}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
