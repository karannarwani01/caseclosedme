// Read-only star rating display (1–5), comic style (yellow fill + ink stroke).
export function Stars({
  value,
  className = "h-5 w-5",
}: {
  value: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className="inline-flex shrink-0"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={className} aria-hidden>
          <path
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 18.9 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
            fill={i <= rounded ? "var(--color-anime-yellow)" : "white"}
            stroke="var(--color-anime-ink)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}
