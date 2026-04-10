export function StaticFallback() {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ backgroundColor: "var(--bg)" }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, var(--accent-subtle) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
