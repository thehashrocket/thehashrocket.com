import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="mb-4 font-mono text-sm text-[var(--accent)]">404</p>
      <h1 className="mb-4 font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
        Page not found
      </h1>
      <p className="mb-8 text-lg text-[var(--text-secondary)]">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-6 py-2.5 font-display text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
      >
        Go home
      </Link>
    </div>
  );
}
