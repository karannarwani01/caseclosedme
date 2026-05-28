"use client";

import { BannerTiles, type QuickFilter } from "components/feed/banner-tiles";
import { FeedCard } from "components/feed/feed-card";
import { FeedFilters } from "components/feed/feed-filters";
import { buildFacets } from "lib/feed-facets";
import type { Product } from "lib/shopify/types";
import { useMemo, useState } from "react";

type SortKey = "relevance" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Relevance",
  "price-asc": "Price: Low to high",
  "price-desc": "Price: High to low",
};

function price(p: Product) {
  return parseFloat(p.priceRange.maxVariantPrice.amount);
}

function toggle(set: Set<string>, value: string) {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}

export function FeedBrowse({
  products,
  heading,
}: {
  products: Product[];
  heading?: string;
}) {
  const facets = useMemo(() => buildFacets(products), [products]);

  const [quickId, setQuickId] = useState<string | null>(null);
  const [quick, setQuick] = useState<QuickFilter | null>(null);
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [series, setSeries] = useState<Set<string>>(new Set());
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  const filtered = useMemo(() => {
    let xs = products.filter((p) => {
      if (cats.size > 0 && !p.tags.some((t) => cats.has(t))) return false;
      if (series.size > 0 && !p.tags.some((t) => series.has(t))) return false;
      if (stockOnly && !p.availableForSale) return false;
      if (quick) {
        if (quick.kind === "badge" && !p.tags.includes(quick.value)) return false;
        if (quick.kind === "category" && !p.tags.includes(quick.value)) return false;
        if (quick.kind === "categories" && !quick.value.some((c) => p.tags.includes(c)))
          return false;
      }
      return true;
    });
    if (sort === "price-asc") xs = [...xs].sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") xs = [...xs].sort((a, b) => price(b) - price(a));
    return xs;
  }, [products, cats, series, stockOnly, quick, sort]);

  const onQuick = (id: string, filter: QuickFilter | null) => {
    if (quickId === id) {
      setQuickId(null);
      setQuick(null);
    } else {
      setQuickId(id);
      setQuick(filter);
    }
  };

  const hasFilters = cats.size > 0 || series.size > 0 || stockOnly || quickId;
  const clearAll = () => {
    setCats(new Set());
    setSeries(new Set());
    setStockOnly(false);
    setQuickId(null);
    setQuick(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1800px] px-6 pt-6 pb-12 lg:px-8">
      {heading ? (
        <h1 className="mb-6 font-display text-3xl font-extrabold uppercase tracking-tight text-anime-ink md:text-4xl">
          {heading}
        </h1>
      ) : null}
      <BannerTiles activeId={quickId} onSelect={onQuick} />

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <div className="w-full flex-none md:w-[230px]">
          <FeedFilters
            categories={facets.categories}
            series={facets.series}
            selectedCategories={cats}
            selectedSeries={series}
            stockOnly={stockOnly}
            onToggleCategory={(l) => setCats((s) => toggle(s, l))}
            onToggleSeries={(l) => setSeries((s) => toggle(s, l))}
            onToggleStock={() => setStockOnly((v) => !v)}
          />
        </div>

        {/* Grid */}
        <div className="min-h-screen w-full">
          {/* Header strip */}
          <header className="mb-6 flex items-center justify-between gap-4 border-b border-anime-ink/10 pb-4">
            <p className="font-display text-sm font-semibold tracking-[0.02em] text-anime-ink">
              <span className="font-extrabold">{filtered.length}</span> Products
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-3 rounded-full bg-anime-ink/5 px-3 py-1 font-sans text-xs text-anime-ink/70 hover:bg-anime-ink/10"
                >
                  Clear filters ✕
                </button>
              ) : null}
            </p>
            <label className="relative inline-flex items-center">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="cursor-pointer appearance-none rounded-md border border-anime-ink/20 bg-white py-2 pl-3 pr-9 font-sans text-sm text-anime-ink outline-none"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    Sort By: {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-anime-ink/50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
          </header>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-anime-ink/20 px-6 py-16 text-center text-anime-ink/50">
              No products match these filters.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full bg-anime-ink px-4 py-2 font-sans text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <li key={p.handle} className="animate-fadeIn">
                  <FeedCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
