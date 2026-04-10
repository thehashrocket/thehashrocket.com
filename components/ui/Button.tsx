import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-hover)] font-display font-semibold",
  secondary:
    "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]",
  ghost:
    "bg-transparent text-[var(--accent)] hover:text-[var(--accent-hover)]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] px-6 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
