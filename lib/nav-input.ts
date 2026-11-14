/**
 * How the visitor activated a nav link: "keyboard" (Enter fires a click with detail 0)
 * or "pointer" (mouse or touch, detail 1+). Chrome treats focus moved by script as
 * keyboard-style either way, so the link records it on <html data-nav-input> and the
 * focus target styles its mark from that (see the Services heading on the homepage).
 */
export type NavInput = "keyboard" | "pointer";

const KEY = "nav-input";

export function navInputFrom(detail: number): NavInput {
  return detail === 0 ? "keyboard" : "pointer";
}

export function setNavInput(input: NavInput) {
  document.documentElement.dataset.navInput = input;
}

/** A link to another page: carry the input across the full page load, for one load only. */
export function rememberNavInput(input: NavInput) {
  try {
    sessionStorage.setItem(KEY, input);
  } catch {
    // Storage blocked (private mode, policy): the target just shows no mark.
  }
}

/** On the landing page: apply a remembered input, then forget it so a later visit starts clean. */
export function restoreNavInput() {
  try {
    const input = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (input === "keyboard" || input === "pointer") setNavInput(input);
  } catch {
    // Storage blocked: no mark.
  }
}
