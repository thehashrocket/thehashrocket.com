/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import { FocusOnHash } from "@/components/ui/FocusOnHash";

function Section() {
  return (
    <>
      <FocusOnHash hash="services" target="services-heading" />
      <h2 id="services-heading" tabIndex={-1}>
        Services
      </h2>
      <a href="/automation-sprint">Sprint</a>
    </>
  );
}

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

// Value: protects=arriving at /#services puts keyboard focus on the Services heading, so the next Tab reaches its
//   first offer link; fails_when=FocusOnHash is removed or listens for the wrong id; why_new=Next's hash scroll
//   leaves focus in the nav; seam=none; no_claim=Next's scroll position (e2e)
describe("FocusOnHash", () => {
  it("focuses the target when the page loads with its hash", () => {
    window.history.replaceState(null, "", "/#services");
    const { getByRole } = render(<Section />);
    expect(document.activeElement).toBe(getByRole("heading"));
  });

  it("focuses the target on a later in-page hash change, and leaves focus alone otherwise", () => {
    const { getByRole } = render(<Section />);
    expect(document.activeElement).toBe(document.body);
    act(() => {
      window.history.replaceState(null, "", "/#services");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(document.activeElement).toBe(getByRole("heading"));
  });

  // Value: protects=only the section's own hash moves focus, and an unmounted page stops listening;
  //   fails_when=the hash check loosens (any hash, or a prefix match) or the listener is never removed;
  //   why_new=the cases above cover the matching hash and no hash only; seam=none; no_claim=none beyond protects
  it("ignores other hashes and stops listening after unmount", () => {
    const { getByRole, unmount } = render(<Section />);
    act(() => {
      window.history.replaceState(null, "", "/#services-extra");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(document.activeElement).not.toBe(getByRole("heading"));

    const heading = getByRole("heading");
    unmount();
    document.body.appendChild(heading);
    window.history.replaceState(null, "", "/#services");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(document.activeElement).not.toBe(heading);
    heading.remove();
  });
});
