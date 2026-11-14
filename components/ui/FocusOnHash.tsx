"use client";

import { useEffect } from "react";

/**
 * Moves keyboard focus to the element with id `target` when the URL hash is `#hash`,
 * on page load and on in-page hash changes, so the next Tab continues from the
 * section the visitor landed on rather than from the nav (or a mobile menu link
 * that just unmounted). `hash` names the section, whose scroll-margin clears the
 * fixed header; `target` is usually its heading and needs `tabIndex={-1}`.
 * Links to the hash must be plain anchors (NavAnchor): Next's Link uses
 * pushState, which fires no hashchange.
 */
export function FocusOnHash({ hash, target }: { hash: string; target: string }) {
  useEffect(() => {
    const focusIfTargeted = () => {
      if (window.location.hash === `#${hash}`) {
        document.getElementById(target)?.focus({ preventScroll: true });
      }
    };
    focusIfTargeted();
    window.addEventListener("hashchange", focusIfTargeted);
    return () => window.removeEventListener("hashchange", focusIfTargeted);
  }, [hash, target]);

  return null;
}
