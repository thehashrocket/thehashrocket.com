/**
 * @vitest-environment jsdom
 * Offer pages hand their project type to the contact form; it stays editable.
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/lib/actions", () => ({ submitContact: vi.fn() }));
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
