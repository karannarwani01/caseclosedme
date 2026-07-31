"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  filterMega,
  type LinkItem,
  MEGA_BY_TITLE,
  megaHasContent,
} from "./mega-config";

export type TopSellingTile = {
  handle: string;
  title: string;
  image: string;
  amount: string;
};

export function NavMenu({
  links,
  featuredImages = {},
  topSelling = [],
  nonEmpty = [],
}: {
  links: LinkItem[];
  featuredImages?: Record<string, string[]>;
  // Best-selling acrylic cases — shown ONLY in the Protectors mega, where they
  // replace the Featured tiles. Every other mega keeps its Featured column.
  topSelling?: TopSellingTile[];
  // Handles of collections that currently have products; everything else is
  // hidden from the menus.
  nonEmpty?: string[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nonEmptySet = useMemo(() => new Set(nonEmpty), [nonEmpty]);
  const visibleLinks = useMemo(
    () => links.filter((l) => megaHasContent(l.title, nonEmptySet)),
    [links, nonEmptySet],
  );

  const baseMega = active ? MEGA_BY_TITLE[active] : null;
  const activeMega = baseMega ? filterMega(baseMega, nonEmptySet) : null;

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = (title: string) => {
    cancelClose();
    setActive(title);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActive(null), 150);
  };

  return (
    <>
      <ul
        onMouseLeave={scheduleClose}
        className="hidden shrink-0 items-center justify-center font-display font-extrabold uppercase tracking-[0.02em] xl:flex xl:gap-3 xl:text-sm 2xl:gap-5 2xl:text-base"
      >
        {visibleLinks.map((l) => (
          <li key={l.title} onMouseEnter={() => openMenu(l.title)}>
            <Link
              href={l.path}
              prefetch={true}
              className="inline-block whitespace-nowrap text-anime-ink transition-colors duration-100 hover:text-anime-pink"
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>

      {activeMega && activeMega.sections.length > 0 && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute inset-x-0 top-full z-40 border-b-[2.5px] border-anime-ink bg-white"
        >
          <div className="mx-auto grid w-full max-w-[1800px] gap-10 px-6 py-12 lg:px-8 lg:grid-cols-[1fr_1.1fr_1.2fr_1.2fr_1.4fr]">
            {activeMega.sections.map((sec) => (
              <div key={sec.heading} className="flex flex-col gap-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-anime-ink">
                  {sec.heading}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {sec.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.path}
                        prefetch={true}
                        className="text-sm font-semibold text-anime-ink/80 transition-colors hover:text-anime-pink"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Protectors alone shows best-selling acrylic cases; every other
                mega keeps its curated Featured collection tiles. */}
            {active?.toLowerCase() === "protectors" && topSelling.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-anime-ink">
                  Top selling
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {topSelling.map((p, i) => (
                    <Link
                      key={p.handle}
                      href={`/product/${p.handle}`}
                      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border-[2.5px] border-anime-ink bg-white p-3 shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-pink)]"
                    >
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="220px"
                        className="object-contain p-3 pb-16 transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full border-[2px] border-anime-ink bg-anime-yellow px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                        #{i + 1}
                      </div>
                      <div className="relative z-10 rounded-lg border-[2px] border-anime-ink bg-white px-3 py-2 shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                        <p className="line-clamp-2 font-display text-xs font-extrabold leading-tight text-anime-ink [hyphens:none]">
                          {p.title}
                        </p>
                        <p className="mt-1 font-display text-[11px] font-extrabold uppercase tracking-wider text-anime-pink">
                          AED {Number(p.amount).toFixed(0)} →
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : activeMega.featured && activeMega.featured.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-anime-ink">
                  Featured
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {activeMega.featured.map((f, i) => {
                    const img = featuredImages[f.collection]?.[i];
                    return (
                      <Link
                        key={f.title}
                        href={`/search/${f.collection}`}
                        className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border-[2.5px] border-anime-ink p-4 shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-pink)]"
                        style={{ background: f.bg }}
                      >
                        {img ? (
                          <>
                            <Image
                              src={img}
                              alt={f.title}
                              fill
                              sizes="220px"
                              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            />
                            <div
                              aria-hidden
                              className="absolute inset-0 bg-gradient-to-t from-anime-ink/70 via-anime-ink/10 to-transparent"
                            />
                          </>
                        ) : null}
                        {f.badge ? (
                          <div className="absolute right-3 top-3 z-10 inline-flex items-center rounded-full border-[2px] border-anime-ink bg-white px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                            {f.badge}
                          </div>
                        ) : null}
                        <div className="relative z-10 rounded-lg border-[2px] border-anime-ink bg-white px-3 py-2 shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                          <p className="font-display text-xs font-extrabold leading-tight text-anime-ink [hyphens:none]">
                            {f.title}
                          </p>
                          <p className="mt-1 font-display text-[11px] font-extrabold uppercase tracking-wider text-anime-pink">
                            Shop now →
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
