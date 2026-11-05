/**
 * @vitest-environment jsdom
 */
// Value: protects=booking clicks and sent messages reach GA4 with their page tag;
//   fails_when=an event is renamed or dropped, or a failed submit counts as a lead;
//   why_new=nothing covered analytics events; seam=none;
//   no_claim=GA4 receiving them (sendGAEvent is mocked)
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const { sendGAEvent, actionState } = vi.hoisted(() => ({
  sendGAEvent: vi.fn(),
  actionState: { current: { success: false, error: null as string | null } },
}));

vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));
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
  actionState.current = { success: false, error: null };
});

describe("conversion events", () => {
  it("records a booking click with its source", () => {
    render(
      <BookingAnchor href="https://example.com/me" source="stockton" className="x">
        Book
      </BookingAnchor>,
    );
    fireEvent.click(screen.getByText("Book"));
    expect(sendGAEvent).toHaveBeenCalledWith("event", "book_call_click", { source: "stockton" });
  });

  it("records a lead when the form succeeds", () => {
    actionState.current = { success: true, error: null };
    render(<ContactForm source="stockton" />);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "generate_lead", {
      method: "contact_form",
      source: "stockton",
    });
  });

  it("records nothing when the form has not succeeded", () => {
    actionState.current = { success: false, error: "Something went wrong." };
    render(<ContactForm />);
    expect(sendGAEvent).not.toHaveBeenCalled();
  });
});
