"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
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
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[var(--bg)]/95 backdrop-blur-sm">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col items-center gap-8">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-2xl font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-6 py-3 font-display text-lg font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
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
