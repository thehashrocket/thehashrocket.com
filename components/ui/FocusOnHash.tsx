"use client";

import { useEffect } from "react";
import { restoreNavInput } from "@/lib/nav-input";

/**
 * Moves keyboard focus to the element with id `target` when the URL hash is `#hash`,
 * on page load and on in-page hash changes, so the next Tab continues from the
 * section the visitor landed on rather than from the nav (or a mobile menu link
 * that just unmounted). `hash` names the section (html's scroll-padding-top keeps it
 * clear of the fixed header); `target` is usually its heading and needs `tabIndex={-1}`.
 * Links to the hash must be plain anchors; see NavAnchor. On load it also applies the
 * keyboard/pointer input a nav link on another page remembered (lib/nav-input.ts).
 */
export function FocusOnHash({ hash, target }: { hash: string; target: string }) {
  useEffect(() => {
    restoreNavInput();
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
