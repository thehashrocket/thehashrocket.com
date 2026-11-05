/**
 * @vitest-environment jsdom
 * Tests for app/work/page.tsx: grouping, diagrams, and in-progress tagging.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/Tag", () => ({
  Tag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { getCaseStudySummaries } from "@/lib/case-studies";

const { default: React } = await import("react");
const { render } = await import("@testing-library/react");

const WorkPage = (await import("@/app/work/page")).default;

describe("WorkPage", () => {
  it("renders one card link per case study", () => {
    const { container } = render(React.createElement(WorkPage));
    const links = container.querySelectorAll("a[href^='/work/']");
    expect(links.length).toBe(getCaseStudySummaries().length);
  });

  it("renders a diagram for every study", () => {
    const { container } = render(React.createElement(WorkPage));
    for (const study of getCaseStudySummaries()) {
      const diagram = container.querySelector(`ol[aria-label='${study.title} flow']`);
      expect(diagram, study.slug).not.toBeNull();
      expect(diagram!.textContent).toContain(study.diagram[0]);
    }
  });

  it("shows each study's outcome", () => {
    const { container } = render(React.createElement(WorkPage));
    for (const study of getCaseStudySummaries()) {
      expect(container.textContent).toContain(study.outcome);
    }
  });

  it("groups studies by what a buyer is shopping for", () => {
    const { container } = render(React.createElement(WorkPage));
    const headings = [...container.querySelectorAll("h2")].map((h) => h.textContent);
    expect(headings).toEqual(
      expect.arrayContaining(["Custom builds", "Rescues and modernization", "Infrastructure and security"]),
    );
  });

  it("tags in-progress work", () => {
    const { container } = render(React.createElement(WorkPage));
    expect(container.textContent).toContain("In progress");
  });

  it("alternates layout direction across rows", () => {
    const { container } = render(React.createElement(WorkPage));
    expect(container.querySelectorAll("[class*='md:flex-row-reverse']").length).toBeGreaterThan(0);
  });
});
