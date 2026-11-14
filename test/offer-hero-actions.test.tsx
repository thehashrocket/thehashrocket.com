/**
 * @vitest-environment jsdom
 */
// Value: protects=every lead × booking state gives the hero exactly one booking-cta (the primary action),
//   in the documented order, with the right labels, links and button styles;
//   fails_when=a new lead or label prop drops the testid, duplicates it, swaps the button styles, or shows a
//   booking link with Cal.com unset; why_new=OfferHeroActions gained lead/messageLabel/bookingLabel for /talks;
//   seam=none; no_claim=Cal.com availability (env stubbed)
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock("@/components/ui/BookingAnchor", () => ({
  BookingAnchor: ({ href, children, className, testId }: { href: string; children: React.ReactNode; className?: string; testId?: string }) => (
    <a href={href} className={className} data-testid={testId}>
      {children}
    </a>
  ),
}));

const { OfferHeroActions } = await import("@/components/ui/OfferHeroActions");
const { primaryButton, secondaryButton } = await import("@/components/ui/BookingLink");

const CAL = "https://example.com/me";
const CONTACT = "/contact?source=talks";
const BOOK = `${CAL}?source=talks`;

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

function actions(lead: "booking" | "message", booking: boolean) {
  vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", booking ? CAL : "");
  const { container } = render(
    <OfferHeroActions source="talks" lead={lead} messageLabel="Ask about a date" bookingLabel="Or book a call" />,
  );
  return [...container.querySelectorAll("a")].map((a) => ({
    text: a.textContent,
    href: a.getAttribute("href"),
    style: a.className === primaryButton ? "primary" : a.className === secondaryButton ? "secondary" : a.className,
    cta: a.getAttribute("data-testid") === "booking-cta",
  }));
}

describe("OfferHeroActions", () => {
  it.each([
    ["booking", true, [
      { text: "Or book a call", href: BOOK, style: "primary", cta: true },
      { text: "Ask about a date", href: CONTACT, style: "secondary", cta: false },
    ]],
    ["booking", false, [{ text: "Ask about a date", href: CONTACT, style: "primary", cta: true }]],
    ["message", true, [
      { text: "Ask about a date", href: CONTACT, style: "primary", cta: true },
      { text: "Or book a call", href: BOOK, style: "secondary", cta: false },
    ]],
    ["message", false, [{ text: "Ask about a date", href: CONTACT, style: "primary", cta: true }]],
  ] as const)("lead=%s, booking on=%s", (lead, booking, expected) => {
    expect(actions(lead, booking)).toEqual(expected);
  });

  it("keeps today's labels by default", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", CAL);
    const { container } = render(<OfferHeroActions source="automation-sprint" />);
    expect([...container.querySelectorAll("a")].map((a) => a.textContent)).toEqual([
      "Book a 20-minute call",
      "Send a message",
    ]);
  });
});
