import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { NavAnchor } from "./NavAnchor";

const links = [
  // Lands on the homepage Services section, which links every offer page (#100).
  { href: "/#services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header role="banner" className="fixed top-0 left-0 right-0 z-50">
      {/* Same backdrop as the mobile menu overlay, so page text scrolling under the fixed
          header doesn't show through. It sits on its own layer: backdrop-filter on the
          header itself would make the header the containing block for MobileNav's
          fixed overlay and shrink the open menu to the header's height. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[var(--bg)]/95 backdrop-blur-sm" />
      <nav
        className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-display text-lg font-bold tracking-tight text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]"
        >
          Jason Shultz
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <NavAnchor
                href={link.href}
                className="inline-flex min-h-11 items-center font-body text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                {link.label}
              </NavAnchor>
            </li>
          ))}
          <li>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
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
