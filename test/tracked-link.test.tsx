/**
 * @vitest-environment jsdom
 */
// Value: protects=homepage clicks into the offer pages reach GA4 as offer_click with the route and where on the
//   page they were (Services list or hero), on every way of opening a link, without blocking navigation, while
//   the hero booking button keeps only book_call_click (ED7, ED15); fails_when=a link loses its placement, a
//   middle click goes uncounted, a right click is counted, the handler prevents navigation, or BookingLink
//   starts sending offer_click; why_new=TrackedLink is new; seam=none;
//   no_claim=GA4 receiving them (sendGAEvent is mocked)
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const { sendGAEvent } = vi.hoisted(() => ({ sendGAEvent: vi.fn() }));
vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));
// next/link needs a mounted app router; a plain anchor that passes the handlers through is enough here.
type AnchorProps = Pick<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className" | "children" | "onClick" | "onAuxClick" | "aria-label"
>;
vi.mock("next/link", () => ({
  default: ({ href, className, children, onClick, onAuxClick, "aria-label": ariaLabel }: AnchorProps) => (
    <a href={href} className={className} onClick={onClick} onAuxClick={onAuxClick} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

// The case-study cards use the router for their hover prefetch; they are not under test here.
vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push: vi.fn() }) }));

const { TrackedLink } = await import("@/components/ui/TrackedLink");
const Home = (await import("@/app/page")).default;

afterEach(() => {
  cleanup();
  sendGAEvent.mockClear();
  vi.unstubAllEnvs();
});

describe("TrackedLink", () => {
  function renderLink() {
    render(
      <TrackedLink href="/talks" placement="home-services">
        Talks
      </TrackedLink>,
    );
    return screen.getByRole("link", { name: "Talks" });
  }
  const auxclick = (button: number) => new MouseEvent("auxclick", { bubbles: true, cancelable: true, button });

  // fireEvent returns false when a handler called preventDefault, so `toBe(true)` means navigation goes ahead.
  it("sends one event for a click, without preventing navigation", () => {
    expect(fireEvent.click(renderLink())).toBe(true);
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "offer_click", { route: "/talks", placement: "home-services" });
  });

  it("sends one event for a modified click (open in a new tab)", () => {
    expect(fireEvent.click(renderLink(), { ctrlKey: true })).toBe(true);
    expect(fireEvent.click(screen.getByRole("link"), { metaKey: true })).toBe(true);
    expect(sendGAEvent).toHaveBeenCalledTimes(2);
  });

  it("sends one event for a middle click, without preventing navigation", () => {
    expect(fireEvent(renderLink(), auxclick(1))).toBe(true);
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "offer_click", { route: "/talks", placement: "home-services" });
  });

  it("sends nothing for a right click", () => {
    fireEvent(renderLink(), auxclick(2));
    expect(sendGAEvent).not.toHaveBeenCalled();
  });
});

// Value: protects=the homepage wires each offer link to its placement and keeps the booking button on its own
//   event; fails_when=a Services link or the hero sprint link goes back to a plain Link, or the hero offer_click
//   lands on BookingLink; why_new=placements are new; seam=next/link and next/navigation mocked;
//   no_claim=the other three Services links (same map, same component)
describe("homepage offer links", () => {
  it("tags the Services links and the hero sprint link; the booking button sends only book_call_click", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "https://cal.com/example");
    render(<Home />);

    fireEvent.click(screen.getByRole("link", { name: /^AI-built app review, \$/ }));
    expect(sendGAEvent).toHaveBeenLastCalledWith("event", "offer_click", {
      route: "/ai-app-review",
      placement: "home-services",
    });

    fireEvent.click(screen.getByRole("link", { name: /^Automation sprint ·/ }));
    expect(sendGAEvent).toHaveBeenLastCalledWith("event", "offer_click", {
      route: "/automation-sprint",
      placement: "home-hero",
    });

    sendGAEvent.mockClear();
    fireEvent.click(screen.getByTestId("home-hero-cta"));
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "book_call_click", { source: "home" });
  });
});
