import Link from "next/link";
import { MobileNav } from "./MobileNav";

const links = [
  { href: "/work", label: "Work" },
  { href: "/locations", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header role="banner" className="fixed top-0 left-0 right-0 z-50">
      <nav
        className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
        >
          Jason Shultz
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-body text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/contact"
              className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Let&apos;s Talk
            </Link>
          </li>
        </ul>

        {/* Mobile nav */}
        <MobileNav links={links} />
      </nav>
    </header>
  );
}
