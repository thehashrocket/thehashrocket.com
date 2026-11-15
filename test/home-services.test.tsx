/**
 * @vitest-environment jsdom
 */
// Value: protects=the homepage Services section (the nav's Services target) has one priced card per offer page,
//   prices rendered from lib/offers.ts, priced offers first, and the footer links every offer page (#107);
//   fails_when=an OFFER_ROUTES page loses its card or footer link, a card retypes a price, or the order puts the
//   free offers ahead of the paid ones; why_new=Services became cards and the footer gained offer links; seam=none
//   (next/link and next/navigation mocked as in tracked-link.test.tsx); no_claim=how the grid lays out (e2e)
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, within } from "@testing-library/react";

vi.mock("@next/third-parties/google", () => ({ sendGAEvent: vi.fn() }));
type AnchorProps = { href: string; className?: string; children: React.ReactNode };
vi.mock("next/link", () => ({
  default: ({ href, className, children }: AnchorProps) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push: vi.fn() }) }));

const Home = (await import("@/app/page")).default;
const { Footer } = await import("@/components/layout/Footer");
const { OFFER_ROUTES } = await import("@/lib/site");
const offers = await import("@/lib/offers");

afterEach(cleanup);

describe("homepage Services cards", () => {
  it("has one card per offer page, priced from lib/offers, priced offers first", () => {
    const { getByTestId } = render(<Home />);
    const list = getByTestId("service-choices");
    const hrefs = within(list)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect([...hrefs].sort()).toEqual([...OFFER_ROUTES].sort());
    expect(hrefs.slice(0, 3)).toEqual(["/automation-sprint", "/ai-app-review", "/care-plan"]);

    const text = list.textContent ?? "";
    expect(text).toContain(offers.formatSprintPrice());
    expect(text).toContain(offers.formatReviewPrice());
    expect(text).toContain(`${offers.formatCarePrice()} a month`);
    expect(text).toContain(`${offers.TALK_MINUTES_MIN}–${offers.TALK_MINUTES_MAX} minute`);
  });
});

describe("footer", () => {
  it("links every offer page", () => {
    const { container } = render(<Footer />);
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    for (const route of OFFER_ROUTES) expect(hrefs, route).toContain(route);
  });
});
