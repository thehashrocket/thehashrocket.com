/**
 * @vitest-environment jsdom
 * Offer pages hand their project type to the contact form; it stays editable.
 */
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";

const submitContact = vi.fn();
vi.mock("@/lib/actions", () => ({ submitContact }));
vi.mock("@next/third-parties/google", () => ({ sendGAEvent: vi.fn() }));

const { ContactForm } = await import("@/components/ui/ContactForm");

function projectSelect(container: HTMLElement) {
  return container.querySelector<HTMLSelectElement>("#projectType")!;
}

describe("ContactForm project type", () => {
  it("preselects the mapped project type", () => {
    const { container } = render(<ContactForm source="ai-app-review" defaultProjectType="AI-built app review" />);
    expect(projectSelect(container).value).toBe("AI-built app review");
  });

  it("leaves 'Choose one' when there is no mapping", () => {
    const { container } = render(<ContactForm source="home" />);
    expect(projectSelect(container).value).toBe("");
  });

  it("submits the visitor's edit, and form reset restores the preselection", () => {
    const { container } = render(<ContactForm source="ai-app-review" defaultProjectType="AI-built app review" />);
    const select = projectSelect(container);
    select.value = "Rescue";
    expect(new FormData(container.querySelector("form")!).get("projectType")).toBe("Rescue");
    container.querySelector("form")!.reset();
    expect(select.value).toBe("AI-built app review");
  });
});

// Value: protects=the next steps and the timeline field follow the visitor's current project type, and a sent
//   message puts both back on the seeded type; fails_when=the flow keys off ?source only, the select is made
//   controlled (React's post-action reset then shows "Choose one" under talk steps), or onReset stops syncing;
//   why_new=the talk type has its own steps and no timeline; seam=submitContact mocked;
//   no_claim=email delivery (test/actions.test.ts)
describe("ContactForm follows the selected project type", () => {

  it("switches into and out of the talk type", () => {
    const { container } = render(<ContactForm source="home" />);
    expect(steps(container)).toMatch(/We do a 20-minute call\./);
    expect(timeline(container)).not.toBeNull();

    fireEvent.change(projectSelect(container), { target: { value: "A talk for my group" } });
    expect(steps(container)).toMatch(/We pick a date and a format\./);
    expect(container.textContent).toContain("Sending this doesn’t reserve a date.");
    expect(timeline(container)).toBeNull();

    fireEvent.change(projectSelect(container), { target: { value: "Rescue" } });
    expect(steps(container)).toMatch(/We do a 20-minute call\./);
    expect(timeline(container)).not.toBeNull();
  });

  // Value: protects=when the browser restores or autofills the select before hydration, the steps and timeline
  //   follow what the select shows, not the seeded type; fails_when=the mount-time DOM read is removed, so an
  //   organizer back on /contact?source=talks with "Rescue" restored sees talk steps and no timeline;
  //   why_new=every other case renders client-side, where the select always starts on the seed; seam=none;
  //   no_claim=which browsers restore form state (simulated by setting the value before hydrateRoot)
  it("follows a select value the browser restored before hydration", async () => {
    const { renderToString } = await import("react-dom/server");
    const { hydrateRoot } = await import("react-dom/client");
    const element = <ContactForm source="talks" defaultProjectType="A talk for my group" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    expect(timeline(container)).toBeNull();

    projectSelect(container).value = "Rescue";
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(projectSelect(container).value).toBe("Rescue");
    expect(steps(container)).toMatch(/We do a 20-minute call\./);
    expect(timeline(container)).not.toBeNull();
    act(() => root!.unmount());
    container.remove();
  });

  // Value: protects=screen readers hear one short line when the steps change, not the whole list again;
  //   fails_when=aria-live moves back onto the list container or the line stops naming the type;
  //   why_new=review finding (the region re-read terms, heading and steps on every change); seam=none;
  //   no_claim=how a given screen reader voices it
  it("announces one short line, and sits right after the project type", () => {
    const { container } = render(<ContactForm source="home" />);
    const region = container.querySelector('[data-testid="contact-flow"]')!;
    expect(region.getAttribute("aria-live")).toBeNull();
    const line = container.querySelector('[data-testid="steps-announcement"]')!;
    expect(line.getAttribute("aria-live")).toBe("polite");
    fireEvent.change(projectSelect(container), { target: { value: "Automation sprint" } });
    expect(line.textContent).toBe("Next steps updated for Automation sprint.");
    // DOM order: the select comes first, then the steps, then the message field.
    const select = projectSelect(container);
    const message = container.querySelector("#message")!;
    expect(select.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(region.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

/** Echoes the allow-listed type the way submitContact does. */
function sentOk(_state: unknown, formData: FormData) {
  return { success: true, error: null, code: null, submittedProjectType: String(formData.get("projectType") ?? "") };
}

/** requestSubmit runs constraint validation, so the required fields need values first. */
async function submit(container: HTMLElement) {
  for (const [id, value] of [
    ["#name", "Pat Organizer"],
    ["#email", "pat@example.com"],
    ["#message", "A talk for our March mixer?"],
  ]) {
    const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(id)!;
    if (!field.value) field.value = value; // direct assignment: not an edit event
  }
  await act(async () => {
    container.querySelector("form")!.requestSubmit();
  });
}

const steps = (container: HTMLElement) => container.querySelector('[data-testid="next-steps"]')!.textContent;
const termsLine = (container: HTMLElement) => container.querySelector('[data-testid="offer-terms"]')?.textContent ?? null;
const timeline = (container: HTMLElement) => container.querySelector("#timeline");

// Value: protects=after a send, the fields clear but the select stays on the sent type (so a follow-up keeps
//   it), and the confirmation and steps describe the sent message until the next edit (DD6, ED2, ED14, owner
//   decision at /ship); fails_when=the reset puts the select back on the arrival type, the receipt reads the
//   live select, the reset counts as an edit, or the edited flag is keyed on success instead of each new state;
//   why_new=sent-type receipt is new; seam=submitContact mocked to echo the allow-listed type;
//   no_claim=real server latency
describe("ContactForm after a send", () => {
  it("names the sent type and keeps it selected for a follow-up, while the fields clear", async () => {
    submitContact.mockImplementationOnce(sentOk);
    const { container } = render(<ContactForm source="talks" defaultProjectType="A talk for my group" />);
    expect(timeline(container)).toBeNull();

    fireEvent.change(projectSelect(container), { target: { value: "Rescue" } });
    expect(timeline(container)).not.toBeNull();
    await submit(container);

    expect((submitContact.mock.calls.at(-1)![1] as FormData).get("projectType")).toBe("Rescue");
    expect(container.textContent).toContain("Message sent (Rescue).");
    // The fields clear; the select stays on what was sent, and so do the timeline field and steps.
    expect(projectSelect(container).value).toBe("Rescue");
    expect(container.querySelector<HTMLInputElement>("#name")!.value).toBe("");
    expect(timeline(container)).not.toBeNull();
    expect(steps(container)).toMatch(/We do a 20-minute call\./);

    // A follow-up sent without touching the select keeps the type.
    submitContact.mockImplementationOnce(sentOk);
    await submit(container);
    expect((submitContact.mock.calls.at(-1)![1] as FormData).get("projectType")).toBe("Rescue");

    // After an edit the steps follow the select again.
    fireEvent.change(projectSelect(container), { target: { value: "A talk for my group" } });
    expect(steps(container)).toMatch(/We pick a date and a format\./);
  });

  it("does not treat the form's own reset as an edit", async () => {
    submitContact.mockImplementationOnce(sentOk);
    const { container } = render(<ContactForm source="talks" defaultProjectType="A talk for my group" />);
    fireEvent.change(projectSelect(container), { target: { value: "Rescue" } });
    await submit(container);
    // The receipt still shows Rescue's steps after a manual reset (which lands the select on the talk).
    act(() => container.querySelector("form")!.reset());
    expect(container.textContent).toContain("Message sent (Rescue).");
    expect(steps(container)).toMatch(/We do a 20-minute call\./);
  });

  it("names nothing when no type was chosen, and shows the generic steps", async () => {
    submitContact.mockImplementationOnce(sentOk);
    const { container } = render(<ContactForm source="home" />);
    await submit(container);
    expect(container.textContent).toContain("Message sent! I’ll reply within one business day.");
    expect(steps(container)).toMatch(/We do a 20-minute call\./);
  });

  it("names the type that was sent, even if the select changed while sending", async () => {
    let resolve: (value: ReturnType<typeof sentOk>) => void = () => {};
    submitContact.mockImplementationOnce(
      (state: unknown, formData: FormData) => new Promise((r) => (resolve = () => r(sentOk(state, formData)))),
    );
    const { container } = render(<ContactForm source="automation-sprint" defaultProjectType="Automation sprint" />);
    await submit(container);
    fireEvent.change(projectSelect(container), { target: { value: "A talk for my group" } });
    await act(async () => resolve(sentOk(null, new FormData())));

    expect(container.textContent).toContain("Message sent (Automation sprint).");
    expect(steps(container)).toMatch(/one-page scope/);
  });

  it("shows the second type after two sends in a row", async () => {
    submitContact.mockImplementationOnce(sentOk).mockImplementationOnce(sentOk);
    const { container } = render(<ContactForm source="talks" defaultProjectType="A talk for my group" />);
    fireEvent.change(projectSelect(container), { target: { value: "Rescue" } });
    await submit(container);
    expect(container.textContent).toContain("Message sent (Rescue).");

    // Changing the type while the first receipt shows, then sending, names the new type.
    fireEvent.change(projectSelect(container), { target: { value: "A talk for my group" } });
    await submit(container);
    expect(container.textContent).toContain("Message sent (A talk for my group).");
    expect(steps(container)).toMatch(/We pick a date and a format\./);
  });

  it("drops the receipt when the next send fails", async () => {
    submitContact.mockImplementationOnce(sentOk);
    const { container } = render(<ContactForm source="talks" defaultProjectType="A talk for my group" />);
    fireEvent.change(projectSelect(container), { target: { value: "Rescue" } });
    await submit(container);
    fireEvent.change(projectSelect(container), { target: { value: "A talk for my group" } });
    submitContact.mockImplementationOnce(() => ({
      success: false,
      error: "Please enter a valid email address.",
      code: null,
      draft: { name: "", email: "", message: "", projectType: "A talk for my group", timeline: "" },
    }));
    await submit(container);

    expect(container.textContent).not.toContain("Message sent");
    expect(steps(container)).toMatch(/We pick a date and a format\./);
  });
});

// Value: protects=the arrival offer's price shows only beside its own type, and never under a receipt for a
//   different offer (DD7, ED3, ED12); fails_when=the terms key off ?source alone, or show beside a receipt; why_new=terms moved from the page into the form; seam=submitContact mocked;
//   no_claim=the price text itself (test/booking-cta.test.tsx renders the real intro)
describe("ContactForm offer terms", () => {
  const terms = { text: "It's a flat $X review.", termsType: "AI-built app review" as const };

  it("follows the select away from and back to the arrival offer", () => {
    const { container } = render(
      <ContactForm source="ai-app-review" defaultProjectType="AI-built app review" terms={terms} />,
    );
    expect(termsLine(container)).toBe(terms.text);
    fireEvent.change(projectSelect(container), { target: { value: "Automation sprint" } });
    expect(termsLine(container)).toBeNull();
    expect(steps(container)).toMatch(/one-page scope/);
    fireEvent.change(projectSelect(container), { target: { value: "AI-built app review" } });
    expect(termsLine(container)).toBe(terms.text);
  });

  it("hides beside a receipt, and resumes on the first edit", async () => {
    submitContact.mockImplementationOnce(sentOk);
    const { container } = render(
      <ContactForm source="ai-app-review" defaultProjectType="AI-built app review" terms={terms} />,
    );
    fireEvent.change(projectSelect(container), { target: { value: "Automation sprint" } });
    await submit(container);

    expect(projectSelect(container).value).toBe("Automation sprint");
    expect(container.textContent).toContain("Message sent (Automation sprint).");
    expect(termsLine(container)).toBeNull();
    expect(steps(container)).toMatch(/one-page scope/);

    // Back on the arrival offer, its price returns, once the receipt is no longer showing.
    fireEvent.change(projectSelect(container), { target: { value: "AI-built app review" } });
    expect(termsLine(container)).toBe(terms.text);
    expect(steps(container)).toMatch(/30-minute walkthrough/);
  });

  // Value: protects=the server-rendered form never shows an offer price, because before the page is
  //   interactive (or with JavaScript off) the browser may have restored a different type into the select;
  //   fails_when=the terms render without the hydration check; why_new=Codex review finding; seam=none;
  //   no_claim=real browsers' form restoration (simulated)
  it("leaves the price line out of the server render", async () => {
    const { renderToString } = await import("react-dom/server");
    const html = renderToString(
      <ContactForm source="ai-app-review" defaultProjectType="AI-built app review" terms={terms} />,
    );
    expect(html).not.toContain(terms.text);
    expect(html).toContain("30-minute walkthrough");
  });

  it("respects a selection the browser restored before hydration", async () => {
    const { renderToString } = await import("react-dom/server");
    const { hydrateRoot } = await import("react-dom/client");
    const element = <ContactForm source="ai-app-review" defaultProjectType="AI-built app review" terms={terms} />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    projectSelect(container).value = "Rescue";
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(termsLine(container)).toBeNull();
    act(() => root!.unmount());
    container.remove();
  });
});

// Value: protects=nothing typed while a send is in flight is lost to the reset after a successful send, while the
//   visitor keeps keyboard focus and can still copy their message, and a stalled send offers another way through;
//   fails_when=the lock disables the text fields (focus drops to the page body), stops applying while pending, or the
//   "Still sending" notice loses its email fallback; why_new=review findings on the first lock (fieldset disabled);
//   seam=none; no_claim=how long a real send takes (mocked pending promise) or real browsers' focus rules (jsdom)
describe("ContactForm while sending", () => {
  function pendingSend() {
    let resolve: () => void = () => {};
    submitContact.mockImplementationOnce(
      (state: unknown, formData: FormData) => new Promise((r) => (resolve = () => r(sentOk(state, formData)))),
    );
    return () => resolve();
  }

  it("makes the text read-only and the selects disabled until the send settles, keeping focus", async () => {
    const settle = pendingSend();
    const { container } = render(<ContactForm source="home" />);
    const email = container.querySelector<HTMLInputElement>("#email")!;
    email.focus();
    await submit(container);

    const message = container.querySelector<HTMLTextAreaElement>("#message")!;
    expect(message.readOnly).toBe(true);
    expect(email.readOnly).toBe(true);
    expect(projectSelect(container).disabled).toBe(true);
    expect(document.activeElement).toBe(email);

    await act(async () => settle());
    expect(message.readOnly).toBe(false);
    expect(projectSelect(container).disabled).toBe(false);
  });

  it("offers email and booking while a send is taking too long", async () => {
    const { CONTACT_FORM_TIMEOUT_MS } = await import("@/lib/constants");
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      pendingSend();
      const { container } = render(<ContactForm source="home" />);
      await submit(container);
      await act(async () => {
        vi.advanceTimersByTime(CONTACT_FORM_TIMEOUT_MS + 1);
      });
      expect(container.textContent).toContain("Still sending");
      expect(container.querySelector('[data-testid="contact-alternative"]')?.textContent).toMatch(/You can email me at/);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("ContactForm fields", () => {
  // Value: protects=the browser caps name and message at the same lengths the server action enforces;
  //   fails_when=NAME_MAX or the message cap changes on one side only, so a visitor types text the server then rejects;
  //   why_new=the maxLength attributes are new and nothing compares them to lib/contact-email.ts; seam=none;
  //   no_claim=MESSAGE_MAX's value (it is private to the "use server" module; actions.test.ts pins 5,000)
  it("caps name and message at the server's limits", async () => {
    const { NAME_MAX } = await import("@/lib/contact-email");
    const { container } = render(<ContactForm source="home" />);
    expect(container.querySelector<HTMLInputElement>("#name")!.maxLength).toBe(NAME_MAX);
    expect(container.querySelector<HTMLTextAreaElement>("#message")!.maxLength).toBe(5000);
  });
});
