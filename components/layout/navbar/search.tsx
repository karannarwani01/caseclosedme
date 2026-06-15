"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Price from "components/price";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Hit = { handle: string; title: string; image: string; price: string };

const inputClass =
  "w-full rounded-xl border-[2.5px] border-anime-ink bg-anime-paper px-4 py-3 pr-11 text-sm font-medium text-anime-ink placeholder:text-anime-ink/55 focus:outline-none shadow-[3px_3px_0_0_var(--color-anime-ink)]";

export default function Search() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams?.get("q") || "");
  const [hits, setHits] = useState<Hit[]>([]);
  const [trending, setTrending] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Trending (best-selling) products, loaded once for the empty/focus state.
  useEffect(() => {
    fetch("/api/search")
      .then((r) => r.json())
      .then((d) => setTrending(d.trending || []))
      .catch(() => {});
  }, []);

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
        const data = await res.json();
        setHits(data.results || []);
      } catch {
        /* ignore */
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const term = q.trim();
  const typing = term.length >= 2;

  const Row = (h: Hit) => (
    <li key={h.handle}>
      <Link
        href={`/product/${h.handle}`}
        prefetch={false}
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 border-b border-anime-ink/10 px-3 py-2.5 transition-colors hover:bg-anime-paper"
      >
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-anime-ink bg-white">
          {h.image ? (
            <Image
              src={h.image}
              alt={h.title}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          ) : null}
        </span>
        <span className="line-clamp-2 flex-1 font-display text-xs font-bold uppercase leading-tight text-anime-ink">
          {h.title}
        </span>
        <Price
          className="shrink-0 font-display text-xs font-extrabold tabular-nums text-anime-ink"
          amount={h.price}
          currencyCode="AED"
        />
      </Link>
    </li>
  );

  return (
    <div ref={boxRef} className="relative w-full">
      <Form
        action="/search"
        className="relative w-full"
        suppressHydrationWarning
        onSubmit={() => setOpen(false)}
      >
        <input
          name="q"
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search drops..."
          autoComplete="off"
          suppressHydrationWarning
          className={inputClass}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-anime-ink">
          <MagnifyingGlassIcon className="h-5 w-5" strokeWidth={2.75} />
        </div>
      </Form>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border-[2.5px] border-anime-ink bg-white shadow-[4px_4px_0_0_var(--color-anime-ink)]">
          {typing ? (
            hits.length === 0 ? (
              <p className="px-4 py-5 text-center text-sm text-anime-ink/60">
                No drops match “{term}”.
              </p>
            ) : (
              <ul className="max-h-[min(60vh,420px)] overflow-auto">
                {hits.map(Row)}
                <li>
                  <Link
                    href={`/search?q=${encodeURIComponent(term)}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-center font-display text-xs font-extrabold uppercase tracking-wide text-anime-pink transition-colors hover:bg-anime-paper"
                  >
                    View all results for “{term}” →
                  </Link>
                </li>
              </ul>
            )
          ) : trending.length > 0 ? (
            <>
              <p className="border-b border-anime-ink/10 px-4 py-2.5 font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-anime-ink/50">
                🔥 Trending now
              </p>
              <ul className="max-h-[min(60vh,420px)] overflow-auto">
                {trending.map(Row)}
              </ul>
            </>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-anime-ink/50">
              Start typing to search drops…
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-full">
      <input placeholder="Search drops..." className={inputClass} />
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-anime-ink">
        <MagnifyingGlassIcon className="h-5 w-5" strokeWidth={2.75} />
      </div>
    </form>
  );
}
