import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

/**
 * A nav link. In-page targets ("/#services") render as a plain <a>: Next's Link
 * changes the hash with pushState, which fires no hashchange, so FocusOnHash could
 * not move keyboard focus to the section. A plain anchor jumps natively on the same
 * page and loads the page at the fragment from anywhere else.
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
  if (href.includes("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
