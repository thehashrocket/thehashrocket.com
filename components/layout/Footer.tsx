import Link from "next/link";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

const internalLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/lab", label: "Lab" },
  { href: "/print-shops", label: "Print shops" },
  { href: "/locations", label: "Locations" },
  { href: "/contact", label: "Contact" },
];

const externalLinks = [
  { href: LINKEDIN_URL, label: "LinkedIn" },
  { href: GITHUB_URL, label: "GitHub" },
];

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]";

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
            Senior Full-Stack Engineer &middot; 20+ years building systems
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {internalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
            {externalLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-sm text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} Jason Shultz. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
