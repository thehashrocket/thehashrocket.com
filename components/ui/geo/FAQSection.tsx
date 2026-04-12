import type { Location } from "@/lib/locations";

export function FAQSection({ location }: { location: Location }) {
  return (
    <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">FAQ</p>
        <h2 className="mb-12 font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl">
          Common questions
        </h2>

        <div className="flex flex-col">
          {location.faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-[var(--border)]"
            >
              <summary className="flex cursor-pointer items-center justify-between py-5 font-display text-lg font-semibold text-[var(--text-primary)] [list-style:none] marker:[content:none] [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-lg font-semibold">{faq.question}</h3>
                <span aria-hidden="true" className="ml-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-[var(--text-secondary)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
