// Stock-urgency bar. Shows "X left in stock" with a progress bar when inventory
// is low; otherwise a simple in-stock / out-of-stock state.
export function StockBar({
  available,
  quantity,
}: {
  available: boolean;
  quantity?: number | null;
}) {
  if (!available) {
    return (
      <p className="font-display text-sm font-extrabold uppercase tracking-wide text-anime-ink/50">
        Out of stock
      </p>
    );
  }

  const low = typeof quantity === "number" && quantity > 0 && quantity <= 10;
  const pct = low ? Math.max(12, Math.min(100, (quantity! / 10) * 100)) : 100;
  const label = low
    ? `Grab it before it's gone! ${quantity} left in stock!`
    : "In stock — ready to ship";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-anime-ink">{label}</p>
      <div className="h-3 w-full overflow-hidden rounded-full border-[2px] border-anime-ink bg-white">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--color-anime-orange), var(--color-anime-pink))",
          }}
        />
      </div>
    </div>
  );
}
