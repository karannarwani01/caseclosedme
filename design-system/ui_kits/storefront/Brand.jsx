// LogoSquare and Wordmark — the digital brand marks.
// LogoSquare uses the pixel cube glyph extracted from the marketing mark.

function LogoSquare({ size = "md" }) {
  const sizes = {
    sm: { w: 32, h: 32, r: 10, pad: 4 },
    md: { w: 40, h: 40, r: 12, pad: 5 },
    lg: { w: 64, h: 64, r: 18, pad: 8 },
  };
  const s = sizes[size];
  return (
    <div
      aria-label="caseclosed.me logo"
      style={{
        width: s.w,
        height: s.h,
        background: "#000",
        borderRadius: s.r,
        padding: s.pad,
        boxSizing: "border-box",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        imageRendering: "pixelated",
      }}
    >
      <img
        src="../../assets/case-closed-cube-white.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: "pixelated",
          display: "block",
        }}
      />
    </div>
  );
}

function Wordmark({ size = 18, color }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: "-0.01em",
        color: color || "var(--fg-1)",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      caseclosed
      <span style={{
        background: "var(--anime-pink, var(--accent))",
        color: "#fff",
        padding: "0 6px",
        borderRadius: 6,
        border: "2px solid var(--anime-ink, var(--brand-ink))",
        marginLeft: 3,
      }}>.me</span>
    </span>
  );
}

Object.assign(window, { LogoSquare, Wordmark });
