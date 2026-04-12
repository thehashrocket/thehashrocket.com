"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { FAQ } from "@/lib/locations";

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  id,
  onKeyDown,
  buttonRef,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <div className="border-b border-[var(--border)]">
      <button
        type="button"
        ref={buttonRef}
        id={`${id}-trigger`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className="flex w-full items-center justify-between py-5 text-left font-display text-lg font-semibold text-[var(--text-primary)] transition-colors duration-[100ms] hover:text-[var(--accent)]"
      >
        <span>{question}</span>
        <svg
          className={`ml-4 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-[200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`grid transition-[grid-template-rows] duration-[200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[var(--text-secondary)]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let targetIndex: number | null = null;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          targetIndex = (index + 1) % faqs.length;
          break;
        case "ArrowUp":
          e.preventDefault();
          targetIndex = (index - 1 + faqs.length) % faqs.length;
          break;
        case "Home":
          e.preventDefault();
          targetIndex = 0;
          break;
        case "End":
          e.preventDefault();
          targetIndex = faqs.length - 1;
          break;
      }

      if (targetIndex !== null) {
        buttonsRef.current[targetIndex]?.focus();
      }
    },
    [faqs.length],
  );

  // Before hydration, render all panels expanded so content is visible without JS.
  // After hydration, accordion behavior takes over.
  const isItemOpen = (index: number) =>
    hydrated ? openIndex === index : true;

  return (
    <section className="border-t border-[var(--border)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">FAQ</p>
        <h2 className="mb-12 font-display text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-5xl">
          Common questions
        </h2>

        <div className="border-t border-[var(--border)]">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              id={`faq-${index}`}
              question={faq.question}
              answer={faq.answer}
              isOpen={isItemOpen(index)}
              onToggle={() => toggle(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              buttonRef={(el) => {
                buttonsRef.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
