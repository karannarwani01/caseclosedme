// Comic-book starburst sticker, ported from the Feed (Direction B) prototype.
// Sits at the top-right of a feed card.

export function StarburstBadge({
  label,
  bg,
  color = "#fff",
}: {
  label: string;
  bg: string;
  color?: string;
}) {
  return (
    <div className="pointer-events-none absolute -right-2 -top-2 z-20 h-16 w-16">
      <svg
        viewBox="0 0 64 64"
        className="block h-full w-full"
        style={{ filter: "drop-shadow(2px 2px 0 rgba(26,26,46,0.25))" }}
      >
        <path
          d="M32 4 L37 14 L48 8 L46 20 L58 22 L50 30 L60 38 L48 40 L52 52 L40 48 L36 60 L30 50 L20 58 L20 46 L8 46 L14 36 L4 30 L14 24 L8 14 L20 16 L22 4 L30 12 Z"
          fill={bg}
          stroke="var(--color-anime-ink)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute inset-0 grid -rotate-12 place-items-center text-center font-display font-extrabold uppercase italic leading-none"
        style={{
          color,
          fontSize: label.length > 6 ? 9 : 10,
          letterSpacing: "0.02em",
          padding: "0 8px",
        }}
      >
        {label.split(" ").map((w, i) => (
          <span key={i} className="block">
            {w}
          </span>
        ))}
      </span>
    </div>
  );
}
