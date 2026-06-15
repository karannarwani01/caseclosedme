"use client";

import {
  ArrowUpLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Price from "components/price";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Hit = { handle: string; title: string; image: string; price: string };

// Fallback trending terms if the admin-managed `trending_search` metaobjects
// can't be loaded. Normally these come from Shopify (editable in admin) via
// /api/search.
const FALLBACK_TERMS = [
  "Funko Pops",
  "One Piece",
  "Dragon Ball",
  "Pokémon",
  "Marvel",
  "Trading Cards",
  "Blind Box",
];

// Full-screen mobile search. Opened from the bottom tab bar via an `open-search`
// window event. Empty state shows trending searches + top products; typing
// switches to live predictive results (same /api/search the desktop box uses).
export function SearchOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [top, setTop] = useState<Hit[]>([]);
  const [terms, setTerms] = useState<string[]>(FALLBACK_TERMS);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false);
    setQ("");
    setHits([]);
  };

  // Open when the bottom tab bar (or anything) dispatches `open-search`.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-search", onOpen);
    return () => window.removeEventListener("open-search", onOpen);
  }, []);

  // Top products (best-sellers) + admin-managed trending terms, loaded once.
  useEffect(() => {
    fetch("/api/search")
      .then((r) => r.json())
      .then((d) => {
        setTop(d.trending || []);
        if (Array.isArray(d.terms) && d.terms.length) setTerms(d.terms);
      })
      .catch(() => {});
  }, []);

  // Focus the field + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open]);

  // Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on navigation (e.g. tapping a result).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Debounced live results as the shopper types.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const d = await res.json();
        setHits(d.results || []);
      } catch {
        /* ignore */
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const term = q.trim();
  const typing = term.length >= 2;

  const go = (t: string) => {
    close();
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  const Row = (h: Hit) => (
    <li key={h.handle}>
      <Link
        href={`/product/${h.handle}`}
        prefetch={false}
        onClick={close}
        className="flex items-center gap-4 border-b border-anime-ink/10 px-5 py-3.5 active:bg-anime-paper"
      >
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-anime-ink bg-white">
          {h.image ? (
            <Image
              src={h.image}
              alt={h.title}
              fill
              sizes="56px"
              className="object-contain p-1"
            />
          ) : null}
        </span>
        <span className="line-clamp-2 flex-1 font-display text-sm font-bold uppercase leading-tight text-anime-ink">
          {h.title}
        </span>
        <Price
          className="shrink-0 font-display text-sm font-extrabold tabular-nums text-anime-ink"
          amount={h.price}
          currencyCode="AED"
        />
      </Link>
    </li>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="px-5 pb-2 pt-6 font-display text-base font-extrabold uppercase tracking-[0.12em] text-anime-ink">
      {children}
    </h2>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className={clsx(
        "fixed inset-0 z-[60] flex flex-col bg-white transition-transform duration-300 ease-out lg:hidden",
        open ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      {/* Search bar */}
      <div className="flex items-center gap-3 border-b-[2.5px] border-anime-ink px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <MagnifyingGlassIcon
          className="h-6 w-6 shrink-0 text-anime-ink"
          strokeWidth={2.5}
        />
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (term) go(term);
          }}
        >
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for figures, brands…"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full bg-transparent text-base font-medium text-anime-ink placeholder:text-anime-ink/50 focus:outline-none"
          />
        </form>
        <button
          type="button"
          onClick={close}
          aria-label="Close search"
          className="shrink-0"
        >
          <XMarkIcon className="h-7 w-7 text-anime-ink" strokeWidth={2.5} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-10">
        {typing ? (
          hits.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-anime-ink/60">
              No drops match “{term}”.
            </p>
          ) : (
            <ul>
              {hits.map(Row)}
              <li>
                <Link
                  href={`/search?q=${encodeURIComponent(term)}`}
                  onClick={close}
                  className="block px-5 py-4 text-center font-display text-sm font-extrabold uppercase tracking-wide text-anime-pink active:bg-anime-paper"
                >
                  View all results for “{term}” →
                </Link>
              </li>
            </ul>
          )
        ) : (
          <>
            <SectionTitle>Trending Searches</SectionTitle>
            <ul>
              {terms.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => setQ(t)}
                    className="flex w-full items-center justify-between border-b border-anime-ink/10 px-5 py-4 text-left active:bg-anime-paper"
                  >
                    <span className="font-display text-base font-extrabold uppercase tracking-wide text-anime-ink">
                      {t}
                    </span>
                    <ArrowUpLeftIcon
                      className="h-5 w-5 shrink-0 text-anime-ink/40"
                      strokeWidth={2.5}
                    />
                  </button>
                </li>
              ))}
            </ul>

            {top.length > 0 ? (
              <>
                <SectionTitle>Top Products</SectionTitle>
                <ul>{top.map(Row)}</ul>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
