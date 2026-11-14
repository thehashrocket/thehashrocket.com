/** A numbered list of plain-text steps, as on the offer pages' "How it works" sections. */
export function NumberedSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-10 flex max-w-[720px] flex-col gap-8">
      {steps.map((step, i) => (
        <li key={step} className="flex gap-6">
          <span aria-hidden="true" className="font-mono text-sm text-[var(--accent)]">
            {i + 1}
          </span>
          <p className="text-lg leading-relaxed text-[var(--text-secondary)]">{step}</p>
        </li>
      ))}
    </ol>
  );
}
