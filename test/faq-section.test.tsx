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

  it("expands a panel when its question is clicked", async () => {
    const user = userEvent.setup();
    render(<FAQSection faqs={faqs} />);

    const firstButton = screen.getByText(faqs[0].question).closest("button")!;
    expect(firstButton).toHaveAttribute("aria-expanded", "false");

    await user.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses a panel when the same question is clicked again", async () => {
    const user = userEvent.setup();
    render(<FAQSection faqs={faqs} />);

    const firstButton = screen.getByText(faqs[0].question).closest("button")!;
    await user.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");

    await user.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
  });

  it("only allows one panel open at a time", async () => {
    const user = userEvent.setup();
    render(<FAQSection faqs={faqs} />);

    const firstButton = screen.getByText(faqs[0].question).closest("button")!;
    const secondButton = screen.getByText(faqs[1].question).closest("button")!;

    await user.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(secondButton).toHaveAttribute("aria-expanded", "false");

    await user.click(secondButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(secondButton).toHaveAttribute("aria-expanded", "true");
  });

  it("has correct ARIA attributes on panels", () => {
    render(<FAQSection faqs={faqs} />);

    for (let i = 0; i < faqs.length; i++) {
      const trigger = screen.getByText(faqs[i].question).closest("button")!;
      expect(trigger).toHaveAttribute("aria-controls", `faq-${i}-panel`);
      expect(trigger).toHaveAttribute("id", `faq-${i}-trigger`);

      const panel = document.getElementById(`faq-${i}-panel`)!;
      expect(panel).toHaveAttribute("role", "region");
      expect(panel).toHaveAttribute("aria-labelledby", `faq-${i}-trigger`);
    }
  });

  it("sets aria-hidden on collapsed panels", async () => {
    const user = userEvent.setup();
    render(<FAQSection faqs={faqs} />);

    // After hydration effect, all panels should be collapsed
    const firstButton = screen.getByText(faqs[0].question).closest("button")!;
    await user.click(firstButton);

    const openPanel = document.getElementById("faq-0-panel")!;
    const closedPanel = document.getElementById("faq-1-panel")!;

    expect(openPanel).toHaveAttribute("aria-hidden", "false");
    expect(closedPanel).toHaveAttribute("aria-hidden", "true");
  });

  describe("keyboard navigation", () => {
    it("moves focus to next item with ArrowDown", async () => {
      const user = userEvent.setup();
      render(<FAQSection faqs={faqs} />);

      const firstButton = screen.getByText(faqs[0].question).closest("button")!;
      const secondButton = screen.getByText(faqs[1].question).closest("button")!;

      firstButton.focus();
      await user.keyboard("{ArrowDown}");
      expect(secondButton).toHaveFocus();
    });

    it("moves focus to previous item with ArrowUp", async () => {
      const user = userEvent.setup();
      render(<FAQSection faqs={faqs} />);

      const secondButton = screen.getByText(faqs[1].question).closest("button")!;
      const firstButton = screen.getByText(faqs[0].question).closest("button")!;

      secondButton.focus();
      await user.keyboard("{ArrowUp}");
      expect(firstButton).toHaveFocus();
    });

    it("wraps focus from last to first with ArrowDown", async () => {
      const user = userEvent.setup();
      render(<FAQSection faqs={faqs} />);

      const lastButton = screen.getByText(faqs[2].question).closest("button")!;
      const firstButton = screen.getByText(faqs[0].question).closest("button")!;

      lastButton.focus();
      await user.keyboard("{ArrowDown}");
      expect(firstButton).toHaveFocus();
    });

    it("wraps focus from first to last with ArrowUp", async () => {
      const user = userEvent.setup();
      render(<FAQSection faqs={faqs} />);

      const firstButton = screen.getByText(faqs[0].question).closest("button")!;
      const lastButton = screen.getByText(faqs[2].question).closest("button")!;

      firstButton.focus();
      await user.keyboard("{ArrowUp}");
      expect(lastButton).toHaveFocus();
    });

    it("moves focus to first item with Home", async () => {
      const user = userEvent.setup();
      render(<FAQSection faqs={faqs} />);

      const secondButton = screen.getByText(faqs[1].question).closest("button")!;
      const firstButton = screen.getByText(faqs[0].question).closest("button")!;

      secondButton.focus();
      await user.keyboard("{Home}");
      expect(firstButton).toHaveFocus();
    });

    it("moves focus to last item with End", async () => {
      const user = userEvent.setup();
      render(<FAQSection faqs={faqs} />);

      const firstButton = screen.getByText(faqs[0].question).closest("button")!;
      const lastButton = screen.getByText(faqs[2].question).closest("button")!;

      firstButton.focus();
      await user.keyboard("{End}");
      expect(lastButton).toHaveFocus();
    });
  });
});
