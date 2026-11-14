/**
 * @vitest-environment jsdom
 * /automation-sprint, /ai-app-review and /print-shops: offer facts render from
 * lib/offers.ts and the case study, never from retyped copy.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

type AnchorProps = { href: string; children: React.ReactNode; className?: string; "data-testid"?: string };
vi.mock("next/link", () => ({
  default: ({ href, children, className, "data-testid": testId }: AnchorProps) => (
    <a href={href} className={className} data-testid={testId}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/ui/BookingAnchor", () => ({
  BookingAnchor: ({ href, children, testId }: { href: string; children: React.ReactNode; testId?: string }) => (
    <a href={href} data-testid={testId}>
      {children}
    </a>
  ),
}));

const { default: React } = await import("react");
const { render } = await import("@testing-library/react");
const { caseStudies } = await import("@/lib/case-studies");
const offers = await import("@/lib/offers");
const content = await import("@/lib/offer-content");
const SprintPage = (await import("@/app/automation-sprint/page")).default;
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
      expect(text).toContain(offers.REVIEW_CREDIT_TEXT);
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
    expect(service.offers).toEqual({ "@type": "Offer", price: offers.REVIEW_PRICE, priceCurrency: "USD" });
    expect(service.provider["@id"]).toBe("https://www.jasonshultz.com/#person");
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(content.reviewFaqs.length);
    expect(JSON.stringify(faq.mainEntity)).toContain(offers.REVIEW_CREDIT_TEXT);
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

afterEach(() => {
  vi.unstubAllEnvs();
});

// Value: protects=each offer hero has exactly one booking-cta whether or not Cal.com is set, with no duplicate contact links;
//   fails_when=BookingLink's fallback renders beside the message link, or the testid lands on ClosingCta too;
//   why_new=no test rendered a hero in both booking states; seam=testId/fallback props (used by production heroes);
//   no_claim=Cal.com availability (env stubbed)
describe.each([
  ["/automation-sprint", SprintPage, "automation-sprint"],
  ["/ai-app-review", ReviewPage, "ai-app-review"],
])("%s hero actions", (_path, Page, source) => {
  it("has one booking-cta with booking on and off", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "https://example.com/me");
    const on = renderPage(Page).container;
    const ctaOn = on.querySelectorAll('[data-testid="booking-cta"]');
    expect(ctaOn).toHaveLength(1);
    expect(ctaOn[0].textContent).toBe("Book a 20-minute call");

    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "");
    const off = renderPage(Page).container;
    const ctaOff = off.querySelectorAll('[data-testid="booking-cta"]');
    expect(ctaOff).toHaveLength(1);
    expect(ctaOff[0].textContent).toBe("Send a message");
    expect(ctaOff[0].getAttribute("href")).toBe(`/contact?source=${source}`);
    expect(off.querySelector('[data-testid="offer-summary"]')).not.toBeNull();
    expect(off.querySelector('[data-testid="offer-scope"]')).not.toBeNull();
  });
});

describe("/automation-sprint", () => {
  it("shows the price range, weeks, systems cap and capacity from lib/offers", () => {
    const { container, text } = renderPage(SprintPage);
    expect(text).toContain(offers.formatUsdRange(offers.SPRINT_PRICE_MIN, offers.SPRINT_PRICE_MAX));
    expect(text).toContain(`${offers.SPRINT_WEEKS} weeks`);
    expect(text).toContain(`up to ${offers.SPRINT_MAX_SYSTEMS}`);
    const cap = offers.capLine(offers.SPRINT_MONTHLY_CAP, "sprints");
    if (cap) expect(text).toContain(cap);
    for (const term of content.sprintTerms) expect(text).toContain(term);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.innerHTML).not.toMatch(/undefined|NaN/);
  });

  // Value: protects=every sprint example links the case study that backs it (claims rule);
  //   fails_when=an example's proofSlug stops matching a case study or the link is dropped;
  //   why_new=new page; seam=none; no_claim=the case study proves sprint-sized delivery
  it("links each example to the case study behind it", () => {
    const { container } = renderPage(SprintPage);
    for (const example of content.sprintExamples) {
      expect(caseStudies[example.proofSlug], example.title).toBeDefined();
      expect(container.querySelector(`a[href="/work/${example.proofSlug}"]`), example.title).not.toBeNull();
    }
  });

  it("publishes the price range and FAQ as JSON-LD and mounts no scene", () => {
    const { container } = renderPage(SprintPage);
    const blocks = jsonLd(container);
    const service = blocks.find((b) => b["@type"] === "Service");
    expect(service.offers).toEqual({
      "@type": "AggregateOffer",
      lowPrice: offers.SPRINT_PRICE_MIN,
      highPrice: offers.SPRINT_PRICE_MAX,
      priceCurrency: "USD",
    });
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(content.sprintFaqs.length);
    expect(container.querySelector('[data-testid="current-scene"]')).toBeNull();
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
