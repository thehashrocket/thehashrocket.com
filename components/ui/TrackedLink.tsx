"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sendGAEvent } from "@next/third-parties/google";

interface TrackedLinkProps {
  href: string;
  /** Where on the page the link sits, e.g. "home-services" or "home-hero". */
  placement: string;
  className?: string;
  children: ReactNode;
}

/**
 * An internal link to an offer page that sends `offer_click { route, placement }`.
 * Fires on every activation: a click (Enter on a focused link arrives as one too),
 * a modified click, and a middle click (auxclick with button 1). A right click opens
 * the context menu, not the page, so it sends nothing. Never prevents navigation.
 * Booking links keep their own `book_call_click` (BookingAnchor).
 */
export function TrackedLink({ href, placement, className, children }: TrackedLinkProps) {
  const send = () => sendGAEvent("event", "offer_click", { route: href, placement });
  return (
    <Link
      href={href}
      className={className}
      onClick={send}
      onAuxClick={(event) => {
        if (event.button === 1) send();
      }}
    >
      {children}
    </Link>
  );
}
