/**
 * @vitest-environment jsdom
 * /ai-app-review and /print-shops: offer facts render from lib/offers.ts and
 * the case study, never from retyped copy.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/ui/BookingAnchor", () => ({
  BookingAnchor: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

const { default: React } = await import("react");
const { render } = await import("@testing-library/react");
const { caseStudies } = await import("@/lib/case-studies");
const offers = await import("@/lib/offers");
const ReviewPage = (await import("@/app/ai-app-review/page")).default;
const PrintPage = (await import("@/app/print-shops/page")).default;

function jsonLd(container: HTMLElement) {
  return [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) =>
    JSON.parse(s.textContent ?? "{}"),
  );
}

// Rendered per test: testing-library unmounts after each one.
function renderPage(Page: () => React.ReactElement) {
  const { container } = render(React.createElement(Page));
  return { container, text: container.textContent ?? "" };
}

describe("/ai-app-review", () => {
  it("shows the price, turnaround, cap and credit from lib/offers", () => {
    const { container, text } = renderPage(ReviewPage);
    expect(text).toContain(offers.formatReviewPrice());
    expect(text).toContain(offers.REVIEW_TURNAROUND);
    expect(text).toContain(`within ${offers.REVIEW_CREDIT_DAYS} days`);
    if (offers.REVIEW_MONTHLY_CAP !== null) {
      expect(text).toContain(`I take ${offers.REVIEW_MONTHLY_CAP} reviews a month`);
    }
    expect(text).toContain(`up to ${offers.REVIEW_MAX_INTEGRATIONS} third-party integrations`);
    expect(container.innerHTML).not.toMatch(/undefined|NaN/);
  });

  it("has one h1 and plain links to the related case studies", () => {
    const { container } = renderPage(ReviewPage);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    for (const slug of ["fleet-security-audit", "automation-rescue"]) {
      expect(container.querySelector(`a[href="/work/${slug}"]`), slug).not.toBeNull();
    }
  });

  it("publishes the Service offer and the FAQ as JSON-LD", () => {
    const { container } = renderPage(ReviewPage);
    const blocks = jsonLd(container);
    const service = blocks.find((b) => b["@type"] === "Service");
    expect(service.offers.price).toBe(offers.REVIEW_PRICE);
    expect(service.offers.priceCurrency).toBe("USD");
    expect(service.provider["@id"]).toBe("https://www.jasonshultz.com/#person");
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(offers.reviewFaqs.length);
  });

  // Value: protects=setting REVIEW_MONTHLY_CAP to null hides the capacity line instead of printing "null reviews";
  //   fails_when=the null gate is dropped or changed to a truthy check that still renders the sentence;
  //   why_new=the test above only runs with the shipped cap of 3, so the null branch never renders;
  //   seam=none; no_claim=any other offer constant being null-safe
  it("hides the monthly cap line when REVIEW_MONTHLY_CAP is null", async () => {
    vi.resetModules();
    vi.doMock("@/lib/offers", async (importOriginal) => ({
      ...(await importOriginal<typeof import("@/lib/offers")>()),
      REVIEW_MONTHLY_CAP: null,
    }));
    try {
      const UncappedPage = (await import("@/app/ai-app-review/page")).default;
      const { container } = render(React.createElement(UncappedPage));
      const text = container.textContent ?? "";
      expect(text).not.toMatch(/reviews a month/);
      expect(text).not.toMatch(/null/);
      expect(text).toContain(offers.REVIEW_CREDIT_TEXT);
    } finally {
      vi.doUnmock("@/lib/offers");
      vi.resetModules();
    }
  });
});

describe("/print-shops", () => {
  const study = caseStudies["print-portal"];

  it("renders every Print Portal result and workflow step", () => {
    const { text } = renderPage(PrintPage);
    for (const result of study.results) expect(text).toContain(result);
    for (const step of study.diagram) expect(text).toContain(step);
    expect(text).toContain("One print shop, after rollout:");
  });

  it("keeps the MIS comparison out of the FAQ JSON-LD and mounts no scene", () => {
    const { container, text } = renderPage(PrintPage);
    const faq = jsonLd(container).find((b) => b["@type"] === "FAQPage");
    expect(JSON.stringify(faq)).not.toMatch(/packaged print MIS/i);
    expect(text).toMatch(/packaged print MIS/i);
    expect(container.querySelector('[data-testid="current-scene"]')).toBeNull();
    expect(container.innerHTML).not.toMatch(/undefined|NaN/);
  });
});
