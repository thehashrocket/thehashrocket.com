"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NavAnchor } from "./NavAnchor";

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const prevOverflowRef = useRef("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflowRef.current;
    };
  }, [open]);

  // Unlock scrolling before navigation starts, not in the effect cleanup after the next
  // render: a same-page hash link ("/#services") scrolls in the same tick as the click.
  const closeForNavigation = () => {
    document.body.style.overflow = prevOverflowRef.current;
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        onClick={() => setOpen(!open)}
        className="relative z-50 flex h-11 w-11 items-center justify-center"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <div className="flex w-5 flex-col gap-1.5">
          <span
            className="block h-px w-full bg-[var(--text-primary)] transition-transform"
            style={
              open
                ? { transform: "rotate(45deg) translate(3px, 3px)" }
                : undefined
            }
          />
          <span
            className="block h-px w-full bg-[var(--text-primary)] transition-opacity"
            style={open ? { opacity: 0 } : undefined}
          />
          <span
            className="block h-px w-full bg-[var(--text-primary)] transition-transform"
            style={
              open
                ? { transform: "rotate(-45deg) translate(3px, -3px)" }
                : undefined
            }
          />
        </div>
      </button>

      {open && (
        // Top-aligned and scrollable so every link stays reachable on a short screen (375×560).
        <div className="fixed inset-0 z-40 flex flex-col items-center overflow-y-auto bg-[var(--bg)]/95 px-6 pt-24 pb-12 backdrop-blur-sm">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col items-center gap-6">
              {links.map((link) => (
                <li key={link.href}>
                  <NavAnchor
                    href={link.href}
                    onClick={closeForNavigation}
                    className="inline-flex min-h-11 items-center font-display text-2xl font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
                  >
                    {link.label}
                  </NavAnchor>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  onClick={closeForNavigation}
                  className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-6 py-3 font-display text-lg font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
                >
                  Let&apos;s Talk
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
