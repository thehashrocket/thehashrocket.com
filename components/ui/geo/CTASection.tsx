import { ClosingCta } from "@/components/ui/ClosingCta";
import type { Location } from "@/lib/locations";

export function CTASection({ location }: { location: Location }) {
  return (
    <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <ClosingCta
          body={`Tell me what your ${location.name} business is dealing with. I'll tell you honestly whether I'm the right fit.`}
          source={location.slug}
        />
      </div>
    </section>
  );
}
