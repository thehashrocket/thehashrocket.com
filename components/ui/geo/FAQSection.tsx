import type { Location } from "@/lib/locations";

export function FAQSection({ location }: { location: Location }) {
  return (
    <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">FAQ</p>
        <h2 className="mb-12 font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl">
          Common questions
        </h2>

        <div className="flex flex-col gap-8">
          {location.faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                {faq.question}
              </h3>
              <p className="mt-2 text-[var(--text-secondary)]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
