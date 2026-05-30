"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_ISO,
  type Country,
} from "lib/country-codes";

/**
 * Universal country dial-code selector. Renders a compact flag + dial-code
 * button that opens a searchable country list. The selected dial code is
 * submitted via a hidden input named `name` (default "phone_country").
 */
export function PhoneCountrySelect({
  name = "phone_country",
  defaultIso = DEFAULT_COUNTRY_ISO,
}: {
  name?: string;
  defaultIso?: string;
}) {
  const [iso, setIso] = useState(defaultIso);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected: Country =
    COUNTRIES.find((c) => c.iso === iso) ||
    COUNTRIES.find((c) => c.iso === DEFAULT_COUNTRY_ISO)!;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [query]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Focus the search box when opening.
  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setQuery("");
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <input type="hidden" name={name} value={selected.dial} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-full items-center gap-1.5 rounded-l-md border-[2.5px] border-r-0 border-anime-ink bg-anime-paper px-3 font-display text-base font-bold text-anime-ink"
      >
        <span
          className={`fi fi-${selected.iso.toLowerCase()} h-4 w-[22px] shrink-0 rounded-sm`}
        />
        <span>{selected.dial}</span>
        <span
          className={`ml-0.5 text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-72 overflow-hidden rounded-md border-[2.5px] border-anime-ink bg-white shadow-[5px_5px_0_0_var(--color-anime-pink)]">
          <div className="border-b-[2.5px] border-anime-ink p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              className="w-full rounded-sm border-2 border-anime-ink/30 bg-white px-3 py-2 text-sm text-anime-ink placeholder:text-anime-ink/40 focus:border-anime-pink focus:outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-2 text-sm text-anime-ink/50">
                No matches
              </li>
            )}
            {results.map((c) => {
              const active = c.iso === selected.iso;
              return (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setIso(c.iso);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-anime-ink hover:bg-anime-paper ${active ? "bg-anime-paper font-bold" : ""}`}
                  >
                    <span
                      className={`fi fi-${c.iso.toLowerCase()} h-4 w-[22px] shrink-0 rounded-sm`}
                    />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-display font-bold text-anime-ink/70">
                      {c.dial}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
