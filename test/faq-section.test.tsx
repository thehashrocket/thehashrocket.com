/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQSection } from "@/components/ui/geo/FAQSection";
import type { FAQ } from "@/lib/locations";

const faqs: FAQ[] = [
  { question: "What services do you offer?", answer: "Custom web applications and data pipelines." },
  { question: "What is your rate?", answer: "Projects start at $10k." },
  { question: "Do you work remotely?", answer: "Yes, with local availability in Central Valley." },
];

describe("FAQSection", () => {
  it("renders all FAQ questions", () => {
    render(<FAQSection faqs={faqs} />);
    for (const faq of faqs) {
      expect(screen.getByText(faq.question)).toBeInTheDocument();
    }
  });

  it("renders all FAQ answers in the DOM", () => {
    render(<FAQSection faqs={faqs} />);
    for (const faq of faqs) {
      expect(screen.getByText(faq.answer)).toBeInTheDocument();
    }
  });

  it("renders each FAQ as a details/summary element", () => {
    render(<FAQSection faqs={faqs} />);
    const details = document.querySelectorAll("details");
    expect(details).toHaveLength(faqs.length);

    for (let i = 0; i < faqs.length; i++) {
      const summary = details[i].querySelector("summary");
      expect(summary).toBeInTheDocument();
      expect(summary!.textContent).toContain(faqs[i].question);
    }
  });

  it("expands a panel when its summary is clicked", async () => {
    const user = userEvent.setup();
    render(<FAQSection faqs={faqs} />);

    const details = document.querySelectorAll("details");
    expect(details[0]).not.toHaveAttribute("open");

    const summary = details[0].querySelector("summary")!;
    await user.click(summary);
    expect(details[0]).toHaveAttribute("open");
  });

  it("collapses a panel when the same summary is clicked again", async () => {
    const user = userEvent.setup();
    render(<FAQSection faqs={faqs} />);

    const details = document.querySelectorAll("details");
    const summary = details[0].querySelector("summary")!;

    await user.click(summary);
    expect(details[0]).toHaveAttribute("open");

    await user.click(summary);
    expect(details[0]).not.toHaveAttribute("open");
  });

  it("all panels start collapsed", () => {
    render(<FAQSection faqs={faqs} />);
    const details = document.querySelectorAll("details");
    for (const detail of details) {
      expect(detail).not.toHaveAttribute("open");
    }
  });

  it("renders the + indicator with aria-hidden", () => {
    render(<FAQSection faqs={faqs} />);
    const indicators = document.querySelectorAll("[aria-hidden='true']");
    expect(indicators.length).toBeGreaterThanOrEqual(faqs.length);
  });
});
