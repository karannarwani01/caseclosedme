"use client";

import clsx from "clsx";
import type { FacetGroup } from "lib/feed-facets";
import { useState } from "react";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        "h-4 w-4 text-anime-ink transition-transform duration-200 " +
        (open ? "rotate-180" : "")
      }
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One collapsible filter block: a bordered sticker card with a colored,
// comic-font header bar.
function Group({
  title,
  accent,
  dark = false,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  accent: string;
  dark?: boolean;
  count?: number;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border-[3px] border-anime-ink bg-white shadow-[5px_5px_0_0_var(--color-anime-ink)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left transition-[filter] hover:brightness-105"
        style={{ background: accent }}
      >
        <span
          className={clsx(
            "flex items-center gap-2 font-comic text-lg uppercase tracking-wide",
            dark ? "text-white" : "text-anime-ink",
          )}
        >
          {title}
          {count ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full border-2 border-anime-ink bg-white px-1 font-comic text-[11px] text-anime-ink">
              {count}
            </span>
          ) : null}
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-anime-ink bg-white shadow-[1.5px_1.5px_0_0_var(--color-anime-ink)]">
          <Chevron open={open} />
        </span>
      </button>
      {open && children ? (
        <div className="flex flex-col gap-0.5 p-2.5">{children}</div>
      ) : null}
    </div>
  );
}

// hex / gradient per colour-facet label, for the swatch dot.
const COLOR_HEX: Record<string, string> = {
  Red: "#ff3b3b",
  Blue: "#3b7bff",
  Green: "#3bd45a",
  Black: "#0d0a1a",
  Pink: "#ff2e93",
  Yellow: "#ffd60a",
  Orange: "#ff6a1f",
  Purple: "#8a2be8",
  White: "#ffffff",
  Grey: "#9aa0a6",
  Brown: "#8a5a2b",
  Multicolour:
    "conic-gradient(#ff3b3b,#ffd60a,#3bd45a,#3b7bff,#8a2be8,#ff2e93,#ff3b3b)",
};

function CheckRow({
  label,
  count,
  checked,
  onToggle,
  swatch,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
  swatch?: string;
}) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-center gap-2.5 rounded-lg border-2 px-2 py-1.5 transition-all",
        checked
          ? "border-anime-ink bg-anime-pink/15"
          : "border-transparent hover:bg-anime-yellow/40",
      )}
    >
      <span
        className={clsx(
          "grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border-[2.5px] border-anime-ink transition-all duration-150",
          checked
            ? "-rotate-6 bg-anime-pink text-white shadow-[1.5px_1.5px_0_0_var(--color-anime-ink)]"
            : "bg-white text-transparent",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
        >
          <path
            d="M4 12l5 5L20 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {swatch ? (
        <span
          aria-hidden
          className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-anime-ink"
          style={{ background: swatch }}
        />
      ) : null}
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="hidden"
      />
      <span
        className={clsx(
          "flex-1 font-display text-[13px]",
          checked
            ? "font-extrabold text-anime-pink"
            : "font-bold text-anime-ink",
        )}
      >
        {label}
      </span>
      {typeof count === "number" ? (
        <span
          className={clsx(
            "rounded-full border-[1.5px] border-anime-ink px-1.5 font-display text-[10px] font-extrabold tabular-nums",
            checked
              ? "bg-anime-pink text-white"
              : "bg-anime-paper text-anime-ink",
          )}
        >
          {count}
        </span>
      ) : null}
    </label>
  );
}

// Dual-thumb price range. Two overlapped native sliders; the `.cc-range` CSS
// keeps both thumbs draggable and gives them the chunky neobrutalist look.
function PriceRange({
  min,
  max,
  lo,
  hi,
  onChange,
}: {
  min: number;
  max: number;
  lo: number;
  hi: number;
  onChange: (lo: number, hi: number) => void;
}) {
  const span = Math.max(max - min, 1);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;
  const step = max > 2000 ? 25 : 5;
  return (
    <div className="px-1 pb-1">
      <div className="mb-3 flex items-center justify-between gap-1 font-display text-[12px] font-extrabold text-anime-ink">
        <span className="rounded-md border-2 border-anime-ink bg-anime-paper px-2 py-0.5 tabular-nums">
          AED {lo.toLocaleString()}
        </span>
        <span className="text-anime-ink/40">—</span>
        <span className="rounded-md border-2 border-anime-ink bg-anime-paper px-2 py-0.5 tabular-nums">
          AED {hi.toLocaleString()}
        </span>
      </div>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full border-2 border-anime-ink bg-white" />
        <div
          className="absolute top-1/2 h-2.5 -translate-y-1/2 bg-anime-pink"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          className="cc-range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label="Minimum price"
          onChange={(e) => onChange(Math.min(Number(e.target.value), hi), hi)}
        />
        <input
          type="range"
          className="cc-range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label="Maximum price"
          onChange={(e) => onChange(lo, Math.max(Number(e.target.value), lo))}
        />
      </div>
    </div>
  );
}

export function FeedFilters({
  groups,
  selected,
  onToggle,
  stockOnly,
  onToggleStock,
  priceMin,
  priceMax,
  priceLo,
  priceHi,
  onPriceChange,
  activeCount,
  onClear,
}: {
  groups: FacetGroup[];
  selected: Record<string, Set<string>>;
  onToggle: (key: string, value: string) => void;
  stockOnly: boolean;
  onToggleStock: () => void;
  priceMin: number;
  priceMax: number;
  priceLo: number;
  priceHi: number;
  onPriceChange: (lo: number, hi: number) => void;
  activeCount: number;
  onClear: () => void;
}) {
  return (
    <aside className="hidden space-y-3 md:block">
      <div className="mb-3 flex items-center gap-2">
        <span className="-rotate-2 rounded-full border-[3px] border-anime-ink bg-anime-pink px-5 py-1 font-comic text-xl uppercase tracking-wider text-white shadow-[3px_3px_0_0_var(--color-anime-ink)]">
          ★ Filters
        </span>
        {activeCount > 0 ? (
          <span className="grid h-7 min-w-7 rotate-3 place-items-center rounded-full border-[2.5px] border-anime-ink bg-anime-yellow px-1.5 font-comic text-sm text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
            {activeCount}
          </span>
        ) : null}
      </div>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="mb-1 w-full rounded-full border-[2.5px] border-anime-ink bg-white py-1.5 font-comic text-sm uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-0.5 hover:bg-anime-cyan hover:shadow-[4px_4px_0_0_var(--color-anime-ink)]"
        >
          ✕ Clear all
        </button>
      ) : null}

      {groups.map((g, i) => (
        <Group
          key={g.key}
          title={g.title}
          accent={g.accent}
          dark={g.dark}
          count={selected[g.key]?.size}
          defaultOpen={i < 2}
        >
          {g.options.map((o) => (
            <CheckRow
              key={o.value}
              label={o.label}
              count={o.count}
              checked={Boolean(selected[g.key]?.has(o.value))}
              onToggle={() => onToggle(g.key, o.value)}
              swatch={g.field === "color" ? COLOR_HEX[o.label] : undefined}
            />
          ))}
        </Group>
      ))}

      <Group
        title="Price"
        accent="var(--color-anime-yellow)"
        count={priceLo > priceMin || priceHi < priceMax ? 1 : undefined}
        defaultOpen={false}
      >
        <PriceRange
          min={priceMin}
          max={priceMax}
          lo={priceLo}
          hi={priceHi}
          onChange={onPriceChange}
        />
      </Group>

      <Group
        title="Stock"
        accent="var(--color-anime-ink)"
        dark
        defaultOpen={false}
      >
        <CheckRow
          label="In stock only"
          checked={stockOnly}
          onToggle={onToggleStock}
        />
      </Group>
    </aside>
  );
}
