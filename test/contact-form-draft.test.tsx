/**
 * @vitest-environment jsdom
 * What a visitor keeps and sees when a send fails (#97): their draft survives every
 * error, a successful send clears the form every time, and a rate-limit denial
 * offers a way out that never leads back to the blocked form.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";

const submitContact = vi.fn();
vi.mock("@/lib/actions", () => ({ submitContact }));
const { sendGAEvent, track } = vi.hoisted(() => ({ sendGAEvent: vi.fn(), track: vi.fn() }));
vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));
vi.mock("@vercel/analytics", () => ({ track }));

const { ContactForm } = await import("@/components/ui/ContactForm");

const DENIED = { success: false, error: "Too many submissions. Try again in 12 minutes.", code: "rate_limited" };
// A real send, as submitContact returns it (leadSent marks an email that went out).
const SENT = { success: true, error: null, code: null, leadSent: true };

function field(container: HTMLElement, id: string) {
  return container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`)!;
}

function fill(container: HTMLElement) {
  fireEvent.change(field(container, "name"), { target: { value: "Pat Organizer" } });
  fireEvent.change(field(container, "email"), { target: { value: "pat@example.com" } });
  fireEvent.change(field(container, "projectType"), { target: { value: "Rescue" } });
  fireEvent.change(field(container, "timeline"), { target: { value: "1–3 months" } });
  fireEvent.change(field(container, "message"), { target: { value: "Our scheduling sheet keeps breaking." } });
}

async function submit(container: HTMLElement) {
  await act(async () => {
    container.querySelector("form")!.requestSubmit();
  });
}

afterEach(() => {
  submitContact.mockReset();
  sendGAEvent.mockClear();
  track.mockClear();
  vi.unstubAllEnvs();
});

describe("ContactForm after a send", () => {
  // Value: protects=a denied or failed send keeps everything the visitor typed;
  //   fails_when=submission goes back through the form action alone and React resets the form;
  //   why_new=React 19 reset uncontrolled fields after every action result, errors included;
  //   seam=submitContact mocked; no_claim=behaviour before hydration (server-action POST, e2e)
  it("keeps the draft after an error", async () => {
    submitContact.mockResolvedValueOnce({
      success: false,
      error: "Your message wasn't sent. It's still in the form, so you can try again in a minute.",
      code: "send_failed",
    });
    const { container } = render(<ContactForm source="talks" />);
    fill(container);
    await submit(container);

    expect(container.textContent).toContain("wasn't sent");
    // A failed send offers the same way through as a denial (owner decision on #97).
    expect(container.querySelector('[data-testid="contact-alternative"]')).not.toBeNull();
    expect(field(container, "name").value).toBe("Pat Organizer");
    expect(field(container, "email").value).toBe("pat@example.com");
    expect(field(container, "projectType").value).toBe("Rescue");
    expect(field(container, "timeline").value).toBe("1–3 months");
    expect(field(container, "message").value).toBe("Our scheduling sheet keeps breaking.");
  });

  // Value: protects=every successful send clears the form, the second one included;
  //   fails_when=the reset effect keys on state.success (true → true never re-runs);
  //   why_new=React's own reset used to cover this; seam=submitContact mocked; no_claim=none beyond protects
  it("clears the form after each of two successful sends", async () => {
    // A server action returns a new object each time; reuse would hide the second state change.
    submitContact.mockResolvedValueOnce({ ...SENT }).mockResolvedValueOnce({ ...SENT });
    const { container } = render(<ContactForm />);
    fill(container);
    await submit(container);
    expect(field(container, "message").value).toBe("");

    fill(container);
    await submit(container);
    expect(submitContact).toHaveBeenCalledTimes(2);
    expect(field(container, "name").value).toBe("");
    expect(field(container, "message").value).toBe("");
    // Value: protects=each of two back-to-back sends counts as a lead; fails_when=the GA effect keys on
    //   state.success like the old reset did; why_new=conversion-events.test.tsx mocks useActionState and renders
    //   one state; seam=none; no_claim=GA4 receiving the event (sendGAEvent mocked)
    expect(sendGAEvent.mock.calls.filter(([, name]) => name === "generate_lead")).toHaveLength(2);
  });

  // Value: protects=the lead's offer is the project type the server accepted, not what the select showed (#115);
  //   fails_when=the lead effect reads the select, the local projectType state or the ?source default;
  //   why_new=conversion-events.test.tsx renders one state where all three agree; seam=submitContact mocked;
  //   no_claim=GA4 or Vercel receiving the event (both mocked)
  it("labels the lead with the offer the server accepted", async () => {
    submitContact.mockResolvedValueOnce({ ...SENT, submittedProjectType: "Automation sprint" });
    const { container } = render(<ContactForm />);
    fill(container); // picks "Rescue" in the select
    await submit(container);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "generate_lead", {
      method: "contact_form",
      source: "direct",
      offer: "Automation sprint",
    });
    expect(track).toHaveBeenCalledWith("generate_lead", { source: "direct", offer: "Automation sprint" });
  });

  // Value: protects=a denied visitor can still reach the owner, by email or booking, never back to /contact, and a
  //   booking keeps the page's real source and its click event; fails_when=the line disappears, the booking link
  //   renders without a URL, points at /contact, or goes back to a hardcoded source=contact; why_new=the denial was
  //   a dead end; seam=submitContact mocked; no_claim=Cal.com reachability
  it.each([
    ["from /talks with a booking URL", "https://cal.example/jason", "talks", "talks"],
    ["with no source and a booking URL", "https://cal.example/jason", undefined, "contact"],
    ["without a booking URL", "", undefined, null],
  ])("offers email%s after a rate-limit denial", async (_label, calcom, source, bookingSource) => {
    const hasBooking = bookingSource !== null;
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", calcom);
    submitContact.mockResolvedValueOnce(DENIED);
    const { container } = render(<ContactForm source={source} />);
    fill(container);
    await submit(container);

    const alert = container.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain("Too many submissions. Try again in 12 minutes.");
    const line = container.querySelector('[data-testid="contact-alternative"]')!;
    const hrefs = [...line.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs[0]).toBe("mailto:jason@jasonshultz.com");
    expect(line.textContent).toContain(hasBooking ? "or book a call." : "jason@jasonshultz.com.");
    expect(hrefs).toHaveLength(hasBooking ? 2 : 1);
    expect(hrefs.some((href) => href?.startsWith("/contact"))).toBe(false);
    if (hasBooking) {
      expect(hrefs[1]).toBe(`https://cal.example/jason?source=${bookingSource}`);
      fireEvent.click(line.querySelectorAll("a")[1]);
      expect(sendGAEvent).toHaveBeenCalledWith("event", "book_call_click", { source: bookingSource });
    }
  });

  // Value: protects=other errors keep their plain message; fails_when=the line shows for every error;
  //   why_new=the line is keyed on the denial code; seam=submitContact mocked; no_claim=none beyond protects
  it("adds no email line to other errors", async () => {
    submitContact.mockResolvedValueOnce({ success: false, error: "Please enter a valid email address.", code: null });
    const { container } = render(<ContactForm />);
    fill(container);
    await submit(container);
    expect(container.querySelector('[data-testid="contact-alternative"]')).toBeNull();
  });
});
