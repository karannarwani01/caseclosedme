"use client";

import clsx from "clsx";
import type { Product } from "lib/shopify/types";
import {
  Black_Ops_One,
  Bungee,
  Luckiest_Guy,
  Orbitron,
  Pirata_One,
} from "next/font/google";
import Image from "next/image";

// Per-franchise display fonts, themed to each tile's character. Decorative, so
// they swap in (no render-block) and aren't preloaded — keeps the page fast.
const pirata = Pirata_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
}); // One Piece
const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
}); // Demon Slayer (Yuji Syuku triggers a Turbopack font-module bug)
const orbitron = Orbitron({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
  preload: false,
}); // Iron Man
const luckiest = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
}); // Pokémon
const blackops = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
}); // Batman

// Comic quick-filter banner tiles. Red sticker with halftone dots, white
// outlined word-stack (black text-stroke), ink border + hard shadow, and a
// small caption underneath. Clicking a tile toggles a quick filter. A tile can
// optionally feature a character cutout (`art`) bleeding off the right edge
// over a comic sunburst background.

export type QuickFilter =
  | { kind: "badge"; value: string }
  | { kind: "category"; value: string }
  | { kind: "categories"; value: string[] };

type Tile = {
  id: string;
  label: string; // supports \n for the stacked word layout
  sub: string;
  filter: QuickFilter | null;
  art?: string; // character cutout shown behind the label
  artWrap?: string; // wrapper sizing/position (defaults to bottom-anchored)
  artFit?: string; // object-fit/position for the image
  bg?: string; // background override (defaults to RED)
  font?: string; // franchise-themed font className (defaults to font-display)
};

const RED = "linear-gradient(135deg, #e23b3b 0%, #a01414 100%)";
// Tropical sunset: warm gold sun melting through coral into hot tropical
// pink — all-warm, no blue, so it reads distinct from the ocean tile.
const TROPICAL =
  "radial-gradient(circle at 50% 32%, #ffe864 0%, #ffaf3c 28%, #ff6f52 58%, #ff2f8e 100%)";
// Deep ocean: aqua surface fading into deep-sea blue — water-breathing vibe.
const OCEAN =
  "radial-gradient(circle at 50% 32%, #7fe0ef 0%, #2bb0e0 38%, #1567b6 72%, #0b3a73 100%)";
// Tech energy: electric violet repulsor glow into deep purple — Stark vibe.
const ENERGY =
  "radial-gradient(circle at 50% 34%, #d9b6ff 0%, #9b5cff 34%, #6a22cc 66%, #2c0a66 100%)";
// Meadow: bright lime sun fading into deep grass green — outdoor Pokémon vibe.
const MEADOW =
  "radial-gradient(circle at 50% 30%, #e6ff8a 0%, #88e23f 34%, #2fa84f 68%, #136b30 100%)";
// Gotham night: steely searchlight glow fading into near-black — vault vibe.
const GOTHAM =
  "radial-gradient(circle at 50% 28%, #6a7aa0 0%, #3a4666 34%, #1b2336 66%, #080b14 100%)";

const TILES: Tile[] = [
  {
    id: "preorder",
    label: "PRE-\nORDER",
    sub: "Pre order",
    filter: { kind: "badge", value: "preorder" },
    art: "/banners/luffy-preorder.png",
    bg: TROPICAL,
    font: pirata.className,
  },
  {
    id: "new",
    label: "NEW\nARRIVALS",
    sub: "New arrivals",
    filter: { kind: "badge", value: "new" },
    art: "/banners/giyu-new.png",
    artWrap: "inset-0",
    artFit: "object-contain object-center",
    bg: OCEAN,
    font: bungee.className,
  },
  {
    id: "figures",
    label: "FIGURE\nTYPES",
    sub: "Type",
    filter: { kind: "category", value: "Figures" },
    art: "/banners/ironman-type.png",
    artWrap: "inset-0",
    artFit: "object-contain object-center",
    bg: ENERGY,
    font: orbitron.className,
  },
  {
    id: "popscards",
    label: "POPS\n+ CARDS",
    sub: "License",
    filter: { kind: "categories", value: ["Funko Pops", "Trading Cards"] },
    art: "/banners/ash-license.png",
    bg: MEADOW,
    font: luckiest.className,
  },
  {
    id: "vault",
    label: "FROM\nTHE VAULT",
    sub: "Brands",
    filter: { kind: "badge", value: "vault" },
    art: "/banners/batman-vault.png",
    artWrap: "inset-0",
    artFit: "object-contain object-center",
    bg: GOTHAM,
    font: blackops.className,
  },
];

// Does a product satisfy a tile's quick filter? Mirrors the filtering in
// feed-browse (all quick-filter kinds match against the product's tags).
function tileMatches(p: Product, filter: QuickFilter | null): boolean {
  if (!filter) return true;
  if (filter.kind === "categories")
    return filter.value.some((c) => p.tags.includes(c));
  return p.tags.includes(filter.value);
}

export function BannerTiles({
  activeId,
  onSelect,
  products,
}: {
  activeId: string | null;
  onSelect: (id: string, filter: QuickFilter | null) => void;
  products: Product[];
}) {
  // Only show tiles that actually match something in this collection, so a
  // quick filter never drops the shopper onto an empty result set.
  const visible = TILES.filter((t) =>
    products.some((p) => tileMatches(p, t.filter)),
  );
  if (!visible.length) return null;

  return (
    <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {visible.map((t) => {
        const active = activeId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id, t.filter)}
            aria-pressed={active}
            className="group block w-full text-center"
          >
            <div
              className={clsx(
                "relative aspect-[5/4] overflow-hidden rounded-2xl border-[2.5px] border-anime-ink transition-all duration-200 ease-out",
                active
                  ? "-translate-x-[2px] -translate-y-[2px] shadow-[7px_7px_0_0_var(--color-anime-pink)]"
                  : "shadow-[5px_5px_0_0_var(--color-anime-ink)] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:rotate-[-0.6deg] group-hover:shadow-[7px_7px_0_0_var(--color-anime-pink)]",
              )}
              style={{ background: t.bg ?? RED }}
            >
              {/* comic speed-line rays (art tiles only) */}
              {t.art ? (
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(from 0deg at 40% 46%, rgba(255,255,255,0.9) 0deg 2deg, transparent 2deg 9deg)",
                  }}
                />
              ) : null}

              {/* halftone dots */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(0,0,0,0.16) 1px, transparent 1.5px)",
                  backgroundSize: "10px 10px",
                }}
              />

              {/* character cutout sitting behind the label */}
              {t.art ? (
                <div
                  className={clsx(
                    "pointer-events-none absolute drop-shadow-[3px_4px_0_rgba(0,0,0,0.35)]",
                    t.artWrap ?? "inset-y-0 left-1/2 w-[82%] -translate-x-1/2",
                  )}
                >
                  <Image
                    src={t.art}
                    alt=""
                    fill
                    className={clsx(
                      "transition-transform duration-300 ease-out group-hover:scale-105",
                      t.artFit ?? "object-contain object-bottom",
                    )}
                    sizes="(min-width:1024px) 13vw, (min-width:640px) 22vw, 45vw"
                  />
                </div>
              ) : null}

              <div className="absolute inset-0 grid place-items-center px-2">
                <span
                  className={clsx(
                    "-rotate-12 whitespace-pre-line text-center text-lg font-extrabold uppercase italic leading-[0.88] tracking-[-0.02em] sm:text-2xl lg:text-3xl",
                    t.font ?? "font-display",
                  )}
                  style={{
                    color: "#fff",
                    WebkitTextStroke: "2px var(--color-anime-ink)",
                    paintOrder: "stroke",
                    textShadow: "3px 3px 0 var(--color-anime-ink)",
                  }}
                >
                  {t.label}
                </span>
              </div>
            </div>
            <span className="mt-2.5 block text-center font-display text-[11px] font-extrabold uppercase tracking-[0.2em] text-anime-ink/70">
              {t.sub}
            </span>
          </button>
        );
      })}
    </section>
  );
}
