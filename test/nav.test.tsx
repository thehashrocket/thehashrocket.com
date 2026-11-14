/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

// Mark Next's Link so the test can tell it from a plain anchor.
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className} data-next-link="">
      {children}
    </a>
  ),
}));

const { Nav } = await import("@/components/layout/Nav");
const { NavAnchor } = await import("@/components/layout/NavAnchor");

// Value: protects=in-page nav targets render as plain anchors, so the browser fires hashchange and FocusOnHash can
//   focus the section, while page links keep client navigation; fails_when=NavAnchor or the nav goes back to Link
//   for "/#services"; why_new=#100 adds the first hash link to the nav; seam=next/link mocked;
//   no_claim=the browser's scroll and focus (e2e site-structure.spec.ts)
describe("nav links", () => {
  it("renders hash targets as plain anchors and pages as Next links", () => {
    const { container } = render(
      <>
        <NavAnchor href="/#services" className="x">
          Services
        </NavAnchor>
        <NavAnchor href="/work" className="x">
          Work
        </NavAnchor>
      </>,
    );
    const [services, work] = container.querySelectorAll("a");
    expect(services.getAttribute("href")).toBe("/#services");
    expect(services.hasAttribute("data-next-link")).toBe(false);
    expect(work.hasAttribute("data-next-link")).toBe(true);
  });

  it("leads the main nav with Services, pointing at the homepage section", () => {
    const { getByRole } = render(<Nav />);
    const main = getByRole("navigation", { name: "Main navigation" });
    const desktop = [...main.querySelectorAll("ul.hidden a")].map((a) => [a.textContent, a.getAttribute("href")]);
    expect(desktop.slice(0, 4)).toEqual([
      ["Services", "/#services"],
      ["Work", "/work"],
      ["About", "/about"],
      ["Contact", "/contact"],
    ]);
  });
});
