"use client";

import { BannerTiles } from "components/feed/banner-tiles";
import { FeedCard } from "components/feed/feed-card";
import { FeedFilters } from "components/feed/feed-filters";
import { buildFacetGroups, matchesFacet } from "lib/feed-facets";
import type { Product } from "lib/shopify/types";
import { useMemo, useState } from "react";

type SortKey =
  | "relevance"
  | "price-desc"
  | "price-asc"
  | "discount"
  | "newest"
  | "oldest";

// How many cards to render per "page" client-side. Caps the rendered grid even
// when the full result set is loaded (e.g. search, which must search all
// products), so big result sets don't all hydrate at once.
const PAGE_SIZE = 48;

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Relevance",
  "price-desc": "Price: High to Low",
  "price-asc": "Price: Low to High",
  discount: "Discount: High to Low",
  newest: "Newest First",
  oldest: "Oldest First",
};

function price(p: Product) {
  return parseFloat(p.priceRange.maxVariantPrice.amount);
}

function discountPct(p: Product) {
  const now = price(p);
  const was = parseFloat(p.compareAtPriceRange?.maxVariantPrice.amount ?? "0");
  return was > now ? (was - now) / was : 0;
}

type LoadMoreResult = {
  products: Product[];
  endCursor: string | null;
  hasNextPage: boolean;
};

export function FeedBrowse({
  products,
  heading,
  availableHandles = [],
  loadMore,
  loadMoreArgs,
  initialCursor = null,
  initialHasMore = false,
}: {
  products: Product[];
  heading?: string;
  availableHandles?: string[];
  // When provided, a "Load more" button fetches the next cursor page from the
  // server and appends it. Filters/sort still run client-side over whatever is
  // loaded so far (load more to widen the set).
  loadMore?: (input: {
    collection: string;
    sortKey?: string;
    reverse?: boolean;
    after: string;
  }) => Promise<LoadMoreResult>;
  loadMoreArgs?: { collection: string; sortKey?: string; reverse?: boolean };
  initialCursor?: string | null;
  initialHasMore?: boolean;
}) {
  const [items, setItems] = useState<Product[]>(products);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const groups = useMemo(() => buildFacetGroups(items), [items]);

  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");

  // Whether the server has more pages to fetch (collection pages); search/demo
  // load everything up front so this is false and we just reveal more locally.
  const canFetchMore = Boolean(loadMore && loadMoreArgs && hasMore);
  const fetchNextPage = async () => {
    if (!loadMore || !loadMoreArgs || !cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await loadMore({ ...loadMoreArgs, after: cursor });
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.handle));
        return [...prev, ...res.products.filter((p) => !seen.has(p.handle))];
      });
      setCursor(res.endCursor);
      setHasMore(res.hasNextPage && res.products.length > 0);
    } finally {
      setLoadingMore(false);
    }
  };

  // Price bounds from the products on the page; null range = full (no filter).
  const priceBounds = useMemo<[number, number]>(() => {
    if (!items.length) return [0, 0];
    const ps = items.map(price);
    return [Math.floor(Math.min(...ps)), Math.ceil(Math.max(...ps))];
  }, [items]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [priceLo, priceHi] = priceRange ?? priceBounds;
  const priceActive =
    priceRange !== null &&
    (priceLo > priceBounds[0] || priceHi < priceBounds[1]);

  const toggleFacet = (key: string, value: string) =>
    setSelected((prev) => {
      const cur = new Set(prev[key] ?? []);
      cur.has(value) ? cur.delete(value) : cur.add(value);
      return { ...prev, [key]: cur };
    });

  const filtered = useMemo(() => {
    let xs = items.filter((p) => {
      for (const g of groups) {
        const chosen = selected[g.key];
        if (chosen && chosen.size > 0) {
          const ok = [...chosen].some((v) => matchesFacet(p, g.field, v));
          if (!ok) return false;
        }
      }
      if (stockOnly && !p.availableForSale) return false;
      if (price(p) < priceLo || price(p) > priceHi) return false;
      return true;
    });
    if (sort === "price-asc") xs = [...xs].sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") xs = [...xs].sort((a, b) => price(b) - price(a));
    if (sort === "discount")
      xs = [...xs].sort((a, b) => discountPct(b) - discountPct(a));
    if (sort === "newest")
      xs = [...xs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "oldest")
      xs = [...xs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return xs;
  }, [items, groups, selected, stockOnly, priceLo, priceHi, sort]);

  const activeCount =
    Object.values(selected).reduce((n, s) => n + s.size, 0) +
    (stockOnly ? 1 : 0) +
    (priceActive ? 1 : 0);
  const hasFilters = activeCount > 0;
  const clearAll = () => {
    setSelected({});
    setStockOnly(false);
    setPriceRange(null);
  };

  // Render only up to visibleCount; "Load more" first reveals already-loaded
  // matches, then (collection pages) fetches the next server page.
  const displayed = filtered.slice(0, visibleCount);
  const moreLocal = visibleCount < filtered.length;
  const canShowMore = moreLocal || canFetchMore;
  const onShowMore = async () => {
    if (moreLocal) {
      setVisibleCount((v) => v + PAGE_SIZE);
    } else if (canFetchMore) {
      await fetchNextPage();
      setVisibleCount((v) => v + PAGE_SIZE);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 pt-6 pb-12 lg:px-8">
      {heading ? (
        <h1 className="mb-6 font-display text-3xl font-extrabold uppercase tracking-tight text-anime-ink md:text-4xl">
          {heading}
        </h1>
      ) : null}
      <BannerTiles availableHandles={availableHandles} />

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <div className="w-full flex-none md:w-[230px]">
          <FeedFilters
            groups={groups}
            selected={selected}
            onToggle={toggleFacet}
            stockOnly={stockOnly}
            onToggleStock={() => setStockOnly((v) => !v)}
            priceMin={priceBounds[0]}
            priceMax={priceBounds[1]}
            priceLo={priceLo}
            priceHi={priceHi}
            onPriceChange={(lo, hi) => setPriceRange([lo, hi])}
            activeCount={activeCount}
            onClear={clearAll}
            resultCount={filtered.length}
          />
        </div>

        {/* Grid */}
        <div className="w-full md:min-h-screen">
          {/* Header strip */}
          <header className="mb-6 flex items-center justify-between gap-4 border-b border-anime-ink/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border-[2.5px] border-anime-ink bg-anime-cyan px-3.5 py-1 font-comic text-sm uppercase tracking-wide text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                {filtered.length}
                {hasMore ? "+" : ""} Products
              </span>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full border-2 border-anime-ink bg-white px-3 py-1 font-comic text-xs uppercase tracking-wide text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-0.5 hover:bg-anime-pink hover:text-white"
                >
                  Clear ✕
                </button>
              ) : null}
            </div>
            <label className="relative inline-flex items-center">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="cursor-pointer appearance-none rounded-full border-[2.5px] border-anime-ink bg-anime-yellow py-2 pl-4 pr-12 font-comic text-sm uppercase tracking-wide text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] outline-none transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-anime-ink)]"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k} className="font-sans normal-case">
                    Sort By: {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-1.5 grid h-7 w-7 place-items-center rounded-full border-2 border-anime-ink bg-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-anime-ink"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
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
              {displayed.map((p) => (
                <li key={p.handle} className="animate-fadeIn">
                  <FeedCard product={p} />
                </li>
              ))}
            </ul>
          )}

          {canShowMore ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={onShowMore}
                disabled={loadingMore}
                className="rounded-full border-[2.5px] border-anime-ink bg-anime-yellow px-8 py-3 font-comic text-sm uppercase tracking-wide text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-anime-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
