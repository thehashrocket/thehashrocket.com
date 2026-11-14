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
