import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: string;
}

export function Card({ accent, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)] ${className}`}
      style={accent ? { borderTopColor: accent, borderTopWidth: 2 } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
