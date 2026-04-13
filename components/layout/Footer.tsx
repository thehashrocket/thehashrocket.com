import Link from "next/link";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-[var(--border)] bg-[var(--bg)]"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-[var(--text-primary)]">
            Jason Shultz
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Senior Full-Stack Engineer &middot; 14 years building systems
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex gap-6">
            <li>
              <Link
                href="/work"
                className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Work
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <p className="text-sm text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} Jason Shultz. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
