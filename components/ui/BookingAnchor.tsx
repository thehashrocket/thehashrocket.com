"use client";

import { sendGAEvent } from "@next/third-parties/google";

interface BookingAnchorProps {
  href: string;
  source?: string;
  className: string;
  testId?: string;
  children: React.ReactNode;
}

/** The outbound Cal.com link. A click is intent, not a booking: those arrive by email. */
export function BookingAnchor({ href, source, className, testId, children }: BookingAnchorProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-testid={testId}
      onClick={() => sendGAEvent("event", "book_call_click", { source: source ?? "direct" })}
    >
      {children}
    </a>
  );
}
