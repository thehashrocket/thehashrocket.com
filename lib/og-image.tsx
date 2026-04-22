interface OgImageTemplateProps {
  title: string;
  subtitle?: string;
  label?: string;
}

export function OgImageTemplate({ title, subtitle, label }: OgImageTemplateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        padding: "80px",
      }}
    >
      {label && (
        <div
          style={{
            color: "#a3e635",
            fontFamily: "Inter",
            fontSize: 18,
            marginBottom: 24,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          color: "#f8fafc",
          fontFamily: "SpaceGrotesk",
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            color: "#94a3b8",
            fontFamily: "Inter",
            fontSize: 28,
            marginTop: 24,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          marginTop: 48,
          color: "#475569",
          fontFamily: "Inter",
          fontSize: 18,
        }}
      >
        thehashrocket.com
      </div>
    </div>
  );
}
