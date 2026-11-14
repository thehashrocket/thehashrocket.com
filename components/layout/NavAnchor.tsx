"use client";

import Link from "next/link";
import type { MouseEvent, MouseEventHandler, ReactNode } from "react";

/**
 * A nav link. In-page targets ("/#services") render as a plain <a>, so they work before
 * hydration and load the page at the fragment from anywhere else.
 *
 * On the target's own page the click is handled here. A native fragment jump would
 * leave a history entry without Next's router state, and Next ignores Back/Forward
 * into such an entry (the page stays on whatever came after it). history.pushState is
 * patched by Next to copy its state onto the new entry. Next's Link can't be used
 * either: it fires no hashchange, so FocusOnHash would never move keyboard focus.
 * Firing hashchange here also refocuses the section when the hash is already set.
 */
export function NavAnchor({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}) {
  if (!href.includes("#")) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const url = new URL(href, window.location.href);
    if (url.pathname !== window.location.pathname) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    if (window.location.hash !== url.hash) {
      window.history.pushState(null, "", url.hash);
    }
    target.scrollIntoView();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
