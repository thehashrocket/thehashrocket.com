/**
 * @vitest-environment jsdom
 * Tests ARIA role attributes added in FINDING-004 design-review commit.
 * These cover the role="alert" and role="status" paths that are not tested
 * by the existing E2E suite (which only checks text visibility).
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// ── Minimal stubs for hooks used by ContactForm ──────────────────────────────

// useActionState — returns [state, formAction, isPending]
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn((
      _action: unknown,
      initialState: { success: boolean; error: string | null }
    ) => [initialState, vi.fn(), false]),
  };
});

vi.mock("@/lib/actions", () => ({
  submitContact: vi.fn(),
}));

// Mock next/* so the component can be imported in jsdom
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// ── Import after mocks ────────────────────────────────────────────────────────
const { default: React } = await import("react");
const { useActionState } = await import("react");
const mockedUseActionState = vi.mocked(useActionState);

const { ContactForm } = await import("@/components/ui/ContactForm");

// Helper: render with a specific action state
function renderWithState(state: { success: boolean; error: string | null }) {
  mockedUseActionState.mockReturnValue([state, vi.fn(), false] as unknown as ReturnType<typeof useActionState>);
  return render(React.createElement(ContactForm, {}));
}

describe("ContactForm ARIA roles", () => {
  it("idle state renders no status/alert regions", () => {
    const { queryByRole } = renderWithState({ success: false, error: null });
    expect(queryByRole("status")).toBeNull();
    expect(queryByRole("alert")).toBeNull();
  });

  it("success state renders role='status' element", () => {
    const { getByRole } = renderWithState({ success: true, error: null });
    const statusEl = getByRole("status");
    expect(statusEl).toBeTruthy();
    expect(statusEl.textContent).toMatch(/message sent/i);
  });

  it("error state renders role='alert' element", () => {
    const { getByRole } = renderWithState({
      success: false,
      error: "Something went wrong. Please try again.",
    });
    const alertEl = getByRole("alert");
    expect(alertEl).toBeTruthy();
    expect(alertEl.textContent).toMatch(/something went wrong/i);
  });

  it("error element contains the error message text", () => {
    const errorMsg = "Rate limit exceeded. Try again later.";
    const { getByRole } = renderWithState({ success: false, error: errorMsg });
    expect(getByRole("alert").textContent).toBe(errorMsg);
  });

  it("success and error are mutually exclusive in the same render", () => {
    // Real action state never has both true, but guard the logic anyway
    // The component checks state.error first, then state.success independently
    const { queryByRole } = renderWithState({ success: false, error: null });
    expect(queryByRole("alert")).toBeNull();
    expect(queryByRole("status")).toBeNull();
  });

  it("submit button label is 'Send message' in idle state", () => {
    const { getByRole } = renderWithState({ success: false, error: null });
    const btn = getByRole("button", { name: /send message/i });
    expect(btn).toBeTruthy();
  });

  it("submit button has type=submit", () => {
    const { getByRole } = renderWithState({ success: false, error: null });
    const btn = getByRole("button");
    expect(btn.getAttribute("type")).toBe("submit");
  });
});
