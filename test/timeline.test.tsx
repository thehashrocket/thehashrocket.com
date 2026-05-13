/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeAll } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";

beforeAll(() => {
  // Mock matchMedia for useIsMobile hook
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }),
  });

  // Mock IntersectionObserver for motion's useInView
  global.IntersectionObserver = class IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    readonly thresholds = [0];
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      // Immediately trigger as intersecting
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});
import { Timeline } from "@/components/ui/Timeline";
import type { CareerEntry } from "@/lib/experience";

const entries: CareerEntry[] = [
  {
    description: "EdTech SaaS platform",
    role: "Senior Software Engineer",
    startYear: 2021,
    endYear: null,
    location: "Remote",
    highlights: ["Built a CRM system", "19% efficiency improvement"],
    technologies: ["React", "Rails"],
  },
  {
    description: "Pharmaceutical distribution",
    role: "Software Engineer",
    startYear: 2018,
    endYear: 2020,
    location: "Sacramento, CA",
    locationSlug: "sacramento",
    highlights: ["Warehouse management system"],
    technologies: ["Rails", "PostgreSQL"],
  },
];

describe("Timeline", () => {
  it("renders career entries with descriptions and roles", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText("EdTech SaaS platform")).toBeInTheDocument();
    expect(screen.getByText("Pharmaceutical distribution")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("renders nothing when given empty array", () => {
    const { container } = render(<Timeline entries={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders Tag components for technologies", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getAllByText("Rails")).toHaveLength(2);
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("renders as a semantic ordered list", () => {
    render(<Timeline entries={entries} />);
    const list = document.querySelector("ol");
    expect(list).toBeInTheDocument();
    const items = document.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(entries.length);
  });

  it("renders date ranges", () => {
    render(<Timeline entries={entries} />);
    expect(screen.getByText("2021–Present")).toBeInTheDocument();
    expect(screen.getByText("2018–2020")).toBeInTheDocument();
  });

  it("entries have aria-label with date range", () => {
    render(<Timeline entries={entries} />);
    const items = document.querySelectorAll("ol > li");
    expect(items[0]).toHaveAttribute(
      "aria-label",
      "EdTech SaaS platform, 2021–Present"
    );
  });
});
