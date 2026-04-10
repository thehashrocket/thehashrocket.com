export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-full)] bg-[var(--accent-subtle)] px-3 py-1 font-mono text-xs text-[var(--accent)]">
      {children}
    </span>
  );
}
