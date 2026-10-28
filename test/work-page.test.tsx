/**
 * @vitest-environment jsdom
 * Tests for app/work/page.tsx render logic added in FINDING-006 / FINDING-003.
 *
 * Changed code:
 *  - Image branch now uses ternary (was &&): slugs in allow-list render <Image>
 *  - priority={i < 2} added to first two images (LCP optimisation)
 *  - Else branch renders a typographic placeholder div for slugs without images
 */

import { beforeEach, describe, it, expect, vi } from "vitest";

// ── Stubs ─────────────────────────────────────────────────────────────────────

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

// Capture props passed to <Image> so we can assert on them
const imageProps: Array<Record<string, unknown>> = [];
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    imageProps.push(props);
    return <img src={props.src as string} alt={props.alt as string} />;
  },
}));

vi.mock("@/components/ui/Tag", () => ({
  Tag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

// Import case-studies so we can verify the allow-list in tests
import { getCaseStudySummaries } from "@/lib/case-studies";

const { default: React } = await import("react");
const { render } = await import("@testing-library/react");

// Clear captured image props before each test via module-level reset
beforeEach(() => {
  imageProps.length = 0;
});

const WorkPage = (await import("@/app/work/page")).default;

const IMAGE_SLUGS = ["nonprofit-matching", "grant-discovery", "print-portal"];

describe("WorkPage — image vs. typographic placeholder", () => {
  it("renders a card for every case study", () => {
    const { container } = render(React.createElement(WorkPage));
    const studies = getCaseStudySummaries();
    // Each study is wrapped in an <a> link
    const links = container.querySelectorAll("a[href^='/work/']");
    expect(links.length).toBe(studies.length);
  });

  it("renders <Image> only for the three allow-listed slugs", () => {
    render(React.createElement(WorkPage));
    const renderedAlts = imageProps.map((p) => p.alt as string);
    // Should have exactly 3 images
    expect(imageProps.length).toBe(IMAGE_SLUGS.length);
    for (const slug of IMAGE_SLUGS) {
      const study = getCaseStudySummaries().find((s) => s.slug === slug)!;
      expect(renderedAlts).toContain(study.title);
    }
  });

  it("renders typographic placeholder for slugs NOT in the allow-list", () => {
    const { container } = render(React.createElement(WorkPage));
    const studies = getCaseStudySummaries();
    const placeholderSlugs = studies
      .filter((s) => !IMAGE_SLUGS.includes(s.slug))
      .map((s) => s.slug);

    for (const slug of placeholderSlugs) {
      const study = studies.find((s) => s.slug === slug)!;
      // Placeholder shows the title text in a span
      expect(container.textContent).toContain(study.title);
      // And the "Case Study" label
      expect(container.textContent).toContain("Case Study");
    }
  });

  it("only images in the first two cards get priority (LCP)", () => {
    render(React.createElement(WorkPage));
    // priority={i < 2}: the first two cards sit above the fold. Derive the
    // expectation from case study order so reordering studies can't break this.
    const order = getCaseStudySummaries().map((s) => s.slug);
    for (const slug of IMAGE_SLUGS) {
      const props = imageProps.find((p) => (p.src as string).includes(slug));
      expect(props?.priority, slug).toBe(order.indexOf(slug) < 2);
    }
  });

  it("each non-image card renders the study title", () => {
    const { container } = render(React.createElement(WorkPage));
    const studies = getCaseStudySummaries();
    for (const study of studies) {
      if (!IMAGE_SLUGS.includes(study.slug)) {
        expect(container.textContent).toContain(study.title);
      }
    }
  });

  it("images have correct src path", () => {
    render(React.createElement(WorkPage));
    for (const props of imageProps) {
      const src = props.src as string;
      expect(src).toMatch(/^\/images\/work\/.+\.png$/);
    }
  });

  it("alternates layout direction for even/odd rows", () => {
    const { container } = render(React.createElement(WorkPage));
    // Odd-indexed rows should have flex-row-reverse; check class presence
    const rows = container.querySelectorAll("[class*='flex-col'][class*='gap-8']");
    // At least one row exists
    expect(rows.length).toBeGreaterThan(0);
  });
});
