"use client";

import type { Facet } from "lib/feed-facets";
import { useState } from "react";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        "h-3.5 w-3.5 text-anime-ink/50 transition-transform duration-200 " +
        (open ? "rotate-180" : "")
      }
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Group({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-anime-ink/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3.5 font-display text-[13px] font-extrabold uppercase tracking-[0.08em] text-anime-ink"
      >
        {title}
        <Chevron open={open} />
      </button>
      {open && children ? <div className="flex flex-col gap-2 pb-4">{children}</div> : null}
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-0.5 text-[13px] text-anime-ink">
      <span
        className={
          "grid h-4 w-4 flex-shrink-0 place-items-center rounded border-[1.5px] text-white " +
          (checked
            ? "border-anime-pink bg-anime-pink"
            : "border-anime-ink/30 bg-transparent")
        }
      >
        {checked ? (
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <input type="checkbox" checked={checked} onChange={onToggle} className="hidden" />
      <span className="flex-1">{label}</span>
      {typeof count === "number" ? (
        <span className="font-sans text-xs tabular-nums text-anime-ink/40">({count})</span>
      ) : null}
    </label>
  );
}

export function FeedFilters({
  categories,
  series,
  selectedCategories,
  selectedSeries,
  stockOnly,
  onToggleCategory,
  onToggleSeries,
  onToggleStock,
}: {
  categories: Facet[];
  series: Facet[];
  selectedCategories: Set<string>;
  selectedSeries: Set<string>;
  stockOnly: boolean;
  onToggleCategory: (label: string) => void;
  onToggleSeries: (label: string) => void;
  onToggleStock: () => void;
}) {
  return (
    <aside className="hidden md:block">
      <h3 className="mb-1 border-b-2 border-anime-ink pb-2 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-anime-ink">
        Filters
      </h3>
      <Group title="Categories">
        {categories.map((f) => (
          <CheckRow
            key={f.label}
            label={f.label}
            count={f.count}
            checked={selectedCategories.has(f.label)}
            onToggle={() => onToggleCategory(f.label)}
          />
        ))}
      </Group>
      <Group title="Series">
        {series.map((f) => (
          <CheckRow
            key={f.label}
            label={f.label}
            count={f.count}
            checked={selectedSeries.has(f.label)}
            onToggle={() => onToggleSeries(f.label)}
          />
        ))}
      </Group>
      <Group title="Price" defaultOpen={false}>
        <div className="text-[13px] text-anime-ink/70">AED 0 — 1,500</div>
        <div className="relative mt-2 h-1 rounded-full bg-anime-ink/10">
          <div className="absolute inset-y-0 left-0 right-1/5 rounded-full bg-anime-pink" />
        </div>
      </Group>
      <Group title="Stock availability" defaultOpen={false}>
        <CheckRow
          label="In stock only"
          checked={stockOnly}
          onToggle={onToggleStock}
        />
      </Group>
    </aside>
  );
}
