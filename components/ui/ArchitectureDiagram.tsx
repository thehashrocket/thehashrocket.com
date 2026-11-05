interface ArchitectureDiagramProps {
  title: string;
  steps: string[];
  accent: string;
  className?: string;
}

/** A case study's flow as DOM text, so it can't leak a client's name the way a screenshot can. */
export function ArchitectureDiagram({ title, steps, accent, className = "" }: ArchitectureDiagramProps) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        backgroundColor: `${accent}10`,
        border: `1px solid ${accent}30`,
      }}
    >
      <ol
        aria-label={`${title} flow`}
        className="flex h-full w-full flex-wrap items-center gap-x-2 gap-y-3 p-6"
      >
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="font-mono text-sm text-[var(--text-muted)]">
                →
              </span>
            )}
            <span
              className="rounded-[var(--radius-sm)] border bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]"
              style={{ borderColor: `${accent}60` }}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
