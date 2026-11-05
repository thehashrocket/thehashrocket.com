import Link from "next/link";
import { BookingLink, secondaryButton } from "@/components/ui/BookingLink";
import type { Location } from "@/lib/locations";
import { getBookingUrl, getContactHref } from "@/lib/site";

export function HeroSection({ location }: { location: Location }) {
  return (
    <section className="flex min-h-[70vh] flex-col items-start justify-center px-6">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 font-mono text-sm text-[var(--text-muted)]">
            <li>
              <Link href="/" className="transition-colors hover:text-[var(--text-primary)]">Home</Link>
            </li>
            <li aria-hidden="true">&gt;</li>
            <li>
              <Link href="/locations" className="transition-colors hover:text-[var(--text-primary)]">Locations</Link>
            </li>
            <li aria-hidden="true">&gt;</li>
            <li aria-current="page" className="text-[var(--text-secondary)]">{location.name}</li>
          </ol>
        </nav>

        <p className="mb-4 font-mono text-sm text-[var(--accent)]">
          {location.region}
        </p>
        <h1 className="max-w-4xl whitespace-pre-line font-display text-[clamp(36px,8vw,48px)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
          {location.heroHeadline}
        </h1>
        <p className="mt-6 max-w-xl text-xl leading-relaxed text-[var(--text-secondary)]">
          {location.heroSubheadline}
        </p>

        {/* Trust proof */}
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs">
          <span><span className="text-[var(--accent)]">20+</span> <span className="text-[var(--text-muted)]">YRS</span></span>
          <span className="text-[var(--text-muted)]">&middot;</span>
          <span><span className="text-[var(--accent)]">$10K+</span> <span className="text-[var(--text-muted)]">PROJECTS</span></span>
          <span className="text-[var(--text-muted)]">&middot;</span>
          <span><span className="text-[var(--accent)]">1:1</span> <span className="text-[var(--text-muted)]">DIRECT</span></span>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <BookingLink source={location.slug} />
          {getBookingUrl(location.slug) ? (
            <Link href={getContactHref(location.slug)} className={secondaryButton}>
              Send a message
            </Link>
          ) : (
            <Link href="/work" className={secondaryButton}>
              See the work
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
