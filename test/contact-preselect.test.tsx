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
  const steps = (container: HTMLElement) => container.querySelector('[data-testid="next-steps"]')!.textContent;
  const timeline = (container: HTMLElement) => container.querySelector("#timeline");

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

  it("restores the seeded type, steps and fields after a successful send", async () => {
    submitContact.mockResolvedValueOnce({ success: true, error: null });
    const { container } = render(<ContactForm source="talks" defaultProjectType="A talk for my group" />);
    expect(timeline(container)).toBeNull();

    fireEvent.change(projectSelect(container), { target: { value: "Rescue" } });
    expect(timeline(container)).not.toBeNull();
    fireEvent.change(container.querySelector("#name")!, { target: { value: "Pat Organizer" } });
    fireEvent.change(container.querySelector("#email")!, { target: { value: "pat@example.com" } });
    fireEvent.change(container.querySelector("#message")!, { target: { value: "A talk for our March mixer?" } });

    await act(async () => {
      container.querySelector("form")!.requestSubmit();
    });

    expect(submitContact).toHaveBeenCalledTimes(1);
    expect((submitContact.mock.calls[0][1] as FormData).get("projectType")).toBe("Rescue");
    expect(container.textContent).toContain("Message sent!");
    expect(projectSelect(container).value).toBe("A talk for my group");
    expect(steps(container)).toMatch(/We pick a date and a format\./);
    expect(timeline(container)).toBeNull();
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
