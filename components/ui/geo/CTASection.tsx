import Link from "next/link";
import type { Location } from "@/lib/locations";

const calcomUrl = process.env.NEXT_PUBLIC_CALCOM_URL;

export function CTASection({ location }: { location: Location }) {
  return (
    <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="mb-6 font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl">
          Ready to build?
        </h2>
        <p className="mb-10 max-w-xl text-lg text-[var(--text-secondary)]">
          Let&apos;s talk about what your {location.name} business needs. I help
          teams architect and build systems that work at scale.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/contact?source=${location.slug}`}
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-8 py-3 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            Get in touch
          </Link>
          {calcomUrl && (
            <a
              href={`${calcomUrl}?source=${location.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-8 py-3 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
            >
              Book a call
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
