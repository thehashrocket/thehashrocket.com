/**
 * @vitest-environment jsdom
 */
// Value: protects=booking clicks and sent messages reach GA4 and Vercel with their page tag and offer, and only a
//   message that really went out counts as a lead (#115, D1, D3);
//   fails_when=an event is renamed or dropped, a failed submit or honeypot catch counts as a lead, offer reads the
//   wrong value, or method leaks to Vercel past its 2-property cap;
//   why_new=nothing covered Vercel, offer or leadSent; seam=none;
//   no_claim=GA4 or Vercel receiving them (sendGAEvent and track are mocked)
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ContactFormState } from "@/lib/actions";

const IDLE: ContactFormState = { success: false, error: null, code: null };

const { sendGAEvent, track, actionState } = vi.hoisted(() => ({
  sendGAEvent: vi.fn(),
  track: vi.fn(),
  actionState: { current: { success: false, error: null, code: null } as ContactFormState },
}));

vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));
vi.mock("@vercel/analytics", () => ({ track }));
vi.mock("@/lib/actions", () => ({ submitContact: vi.fn() }));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useActionState: () => [actionState.current, vi.fn(), false],
}));

const { BookingAnchor } = await import("@/components/ui/BookingAnchor");
const { ContactForm } = await import("@/components/ui/ContactForm");

afterEach(() => {
  cleanup();
  sendGAEvent.mockClear();
  track.mockClear();
  actionState.current = IDLE;
});

describe("conversion events", () => {
  it("records a booking click with its source in both destinations", () => {
    render(
      <BookingAnchor href="https://example.com/me" source="stockton" className="x">
        Book
      </BookingAnchor>,
    );
    fireEvent.click(screen.getByText("Book"));
    expect(sendGAEvent).toHaveBeenCalledWith("event", "book_call_click", { source: "stockton" });
    expect(track).toHaveBeenCalledWith("book_call_click", { source: "stockton" });
  });

  it("records a sent message as a lead with the offer the server accepted", () => {
    actionState.current = { ...IDLE, success: true, submittedProjectType: "Automation sprint", leadSent: true };
    render(<ContactForm source="automation-sprint" />);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "generate_lead", {
      method: "contact_form",
      source: "automation-sprint",
      offer: "Automation sprint",
    });
    // Pro allows 2 properties per Vercel custom event; method is constant, so it stays in GA4 only.
    expect(track).toHaveBeenCalledWith("generate_lead", { source: "automation-sprint", offer: "Automation sprint" });
  });

  it('labels a lead with no project type as offer "none"', () => {
    actionState.current = { ...IDLE, success: true, submittedProjectType: "", leadSent: true };
    render(<ContactForm />);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "generate_lead", {
      method: "contact_form",
      source: "direct",
      offer: "none",
    });
    expect(track).toHaveBeenCalledWith("generate_lead", { source: "direct", offer: "none" });
  });

  it("records nothing for a success that sent no email (honeypot catch or test run)", () => {
    actionState.current = { ...IDLE, success: true, submittedProjectType: "Rescue" };
    render(<ContactForm />);
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("records nothing when the form has not succeeded", () => {
    actionState.current = { ...IDLE, error: "Something went wrong." };
    render(<ContactForm />);
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
