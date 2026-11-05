/**
 * @vitest-environment jsdom
 * Value: protects=a location page lists its connectors in order with their own line and skips stale slugs;
 *   fails_when=the unknown-slug guard goes (crash on spread/undefined card) or connectors stop driving the list;
 *   why_new=claims.test.ts checks the data and e2e counts links on one page; neither renders a stale slug;
 *   seam=none; no_claim=the shipped location data (fixture overrides caseStudyConnectors)
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { caseStudySlugs } from "@/lib/case-studies";
import { getLocation, locationSlugs } from "@/lib/locations";

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

const { CaseStudiesSection } = await import("@/components/ui/geo/CaseStudiesSection");

describe("CaseStudiesSection", () => {
  it("renders connectors in order and skips slugs with no study", () => {
    const [first, second] = [caseStudySlugs[1], caseStudySlugs[0]];
    const location = {
      ...getLocation(locationSlugs[0])!,
      caseStudyConnectors: [
        { slug: first, connector: "First connector line" },
        { slug: "deleted-study", connector: "Stale connector line" },
        { slug: second, connector: "Second connector line" },
      ],
    };

    const { container } = render(<CaseStudiesSection location={location} />);

    const cards = [...container.querySelectorAll("a")];
    expect(cards.map((a) => a.getAttribute("href"))).toEqual([`/work/${first}`, `/work/${second}`]);
    expect(cards[0].textContent).toContain("First connector line");
    expect(cards[1].textContent).toContain("Second connector line");
    expect(container.textContent).not.toContain("Stale connector line");
  });
});
