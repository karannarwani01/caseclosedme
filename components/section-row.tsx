import { GridTileImage } from "components/grid/tile";
import { WishlistButton } from "components/wishlist/wishlist-button";
import { getCollectionProducts, getProducts } from "lib/shopify";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

type MaybeMockProduct = Product & {
  swatch?: [string, string];
  badge?: string;
};

export async function JustArrivedRow() {
  let products = (await getCollectionProducts({
    collection: "just-arrived",
  })) as MaybeMockProduct[];

  // No curated `just-arrived` collection? Fall back to the newest live products
  // so the row still renders outside demo mode.
  if (!products.length) {
    products = (await getProducts({
      sortKey: "CREATED_AT",
      reverse: true,
    })) as MaybeMockProduct[];
  }

  if (!products.length) return null;

  return (
    <SectionShell
      eyebrow="★ Fresh off the truck"
      title="Just arrived"
      ctaText="See all new →"
      ctaHref="/search"
    >
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
        {products.slice(0, 6).map((p) => (
          <li key={p.handle} className="relative aspect-square">
            <Link
              href={`/product/${p.handle}`}
              className="relative block h-full w-full"
            >
              <GridTileImage
                src={p.featuredImage?.url ?? ""}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                alt={p.title}
                swatch={p.swatch}
                badge={p.badge}
                zoom
                label={{
                  title: p.title,
                  amount: p.priceRange.maxVariantPrice.amount,
                  currencyCode: p.priceRange.maxVariantPrice.currencyCode,
                }}
              />
            </Link>
            <WishlistButton product={p} variant="card" />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

// One-row "Arriving soon" — pulls the `pre-order` collection; while you build,
// falls back to the earliest-listed items so the row still renders.
export async function ArrivingSoonRow() {
  let products = (await getCollectionProducts({
    collection: "pre-order",
  })) as MaybeMockProduct[];

  if (!products.length) {
    products = (await getProducts({
      sortKey: "CREATED_AT",
      reverse: false,
    })) as MaybeMockProduct[];
  }

  if (!products.length) return null;

  return (
    <SectionShell
      eyebrow="⏳ Dropping soon"
      title="Arriving soon"
      ctaText="See what's coming →"
      ctaHref="/search/pre-order"
    >
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
        {products.slice(0, 6).map((p) => (
          <li key={p.handle} className="relative aspect-square">
            <Link
              href={`/product/${p.handle}`}
              className="relative block h-full w-full"
            >
              <GridTileImage
                src={p.featuredImage?.url ?? ""}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                alt={p.title}
                swatch={p.swatch}
                badge={p.badge}
                zoom
                label={{
                  title: p.title,
                  amount: p.priceRange.maxVariantPrice.amount,
                  currencyCode: p.priceRange.maxVariantPrice.currencyCode,
                }}
              />
            </Link>
            <WishlistButton product={p} variant="card" />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export async function TopTenSection() {
  let products = (await getCollectionProducts({
    collection: "top-10",
  })) as MaybeMockProduct[];

  // No curated `top-10` collection? Fall back to best-sellers from the live
  // catalog so the chart still renders outside demo mode.
  if (!products.length) {
    products = (await getProducts({
      sortKey: "BEST_SELLING",
    })) as MaybeMockProduct[];
  }

  if (!products.length) return null;

  return (
    <SectionShell
      eyebrow="♛ Collector's choice"
      title="Top 10 Picks"
      ctaText="See full chart →"
      ctaHref="/search"
    >
      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 lg:gap-x-2">
        {products.slice(0, 10).map((p, i) => (
          <li key={p.handle} className="relative flex flex-col">
            {/* heart in the card's top-left corner (rank crown sits top-center) */}
            <WishlistButton
              product={p}
              variant="card"
              positionClass="left-2 top-5"
            />
            <Link
              href={`/product/${p.handle}`}
              className="group flex flex-col items-center"
            >
              <div className="relative w-full px-1">
                {/* Rank medallion floats above the card */}
                <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
                  <RankBadge rank={i + 1} />
                </div>
                {/* Red collector card */}
                <div
                  className="relative mt-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-[2.5px] border-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all group-hover:-translate-y-[3px] group-hover:shadow-[6px_6px_0_0_var(--color-anime-pink)]"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 32%, #e23b3b 0%, #a01414 70%, #7d0f0f 100%)",
                  }}
                >
                  {p.featuredImage?.url ? (
                    <Image
                      src={p.featuredImage.url}
                      alt={p.title}
                      fill
                      sizes="(min-width: 1024px) 10vw, (min-width: 640px) 22vw, 45vw"
                      className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <ProductOrb swatch={p.swatch} />
                  )}
                </div>
              </div>
              <span className="mt-3 line-clamp-2 px-1 text-center font-display text-xs font-bold leading-snug text-anime-ink md:text-sm">
                {p.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

// Demo fallback when a product has no image: a glossy colored orb from its swatch.
function ProductOrb({ swatch }: { swatch?: [string, string] }) {
  const [a, b] = swatch ?? ["#ffffff", "#dddddd"];
  return (
    <div
      className="h-[62%] w-[62%] rounded-full border-[2.5px] border-anime-ink"
      style={{
        background: `radial-gradient(circle at 38% 30%, ${a} 0%, ${b} 78%)`,
        boxShadow: "3px 3px 0 0 rgba(13,10,26,0.55)",
      }}
    />
  );
}

export async function ShopAllGrid() {
  const products = (await getCollectionProducts({
    collection: "",
  })) as MaybeMockProduct[];

  if (!products.length) return null;

  return (
    <SectionShell
      eyebrow="All products"
      title="Shop everything"
      ctaText="Open search →"
      ctaHref="/search"
    >
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <li key={p.handle} className="relative aspect-square min-h-[200px]">
            <Link
              href={`/product/${p.handle}`}
              className="relative block h-full w-full"
            >
              <GridTileImage
                src={p.featuredImage?.url ?? ""}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                alt={p.title}
                swatch={p.swatch}
                badge={p.badge}
                label={{
                  title: p.title,
                  amount: p.priceRange.maxVariantPrice.amount,
                  currencyCode: p.priceRange.maxVariantPrice.currencyCode,
                }}
              />
            </Link>
            <WishlistButton product={p} variant="card" />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function SectionShell({
  eyebrow,
  title,
  ctaText,
  ctaHref,
  children,
}: {
  eyebrow: string;
  title: string;
  ctaText: string;
  ctaHref: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto mt-14 w-full px-4 md:mt-20 md:px-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
        <span className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-lime px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] md:text-sm">
          {eyebrow}
        </span>
        <h2 className="font-display text-4xl font-extrabold leading-[1] tracking-[-0.02em] text-anime-ink md:text-6xl lg:text-7xl">
          {title}
        </h2>
        <Link
          href={ctaHref}
          className="mt-1 inline-flex items-center gap-1 font-display text-sm font-extrabold uppercase tracking-wider text-anime-ink underline decoration-anime-pink decoration-[3px] underline-offset-4 hover:text-anime-pink"
        >
          {ctaText}
        </Link>
      </div>
      {children}
    </section>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const palette = {
      1: { from: "#ffd84d", to: "#e3a400" }, // gold
      2: { from: "#e6e6e6", to: "#a9a9a9" }, // silver
      3: { from: "#eaa46a", to: "#bf7330" }, // bronze
    }[rank]!;
    return <CrownBadge rank={rank} from={palette.from} to={palette.to} />;
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md border-[2.5px] border-anime-ink bg-[#d32020] font-display text-sm font-extrabold text-white shadow-[2px_2px_0_0_var(--color-anime-ink)] md:h-8 md:w-8 md:text-base">
      {rank}
    </span>
  );
}

function CrownBadge({
  rank,
  from,
  to,
}: {
  rank: number;
  from: string;
  to: string;
}) {
  const id = `crown-grad-${rank}`;
  return (
    <div className="relative flex h-9 w-11 items-center justify-center md:h-10 md:w-12">
      <svg
        viewBox="0 0 48 40"
        className="absolute inset-0 h-full w-full"
        style={{ filter: "drop-shadow(2px 2px 0 #0d0a1a)" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <path
          d="M4 13 L14 21 L24 6 L34 21 L44 13 L40 35 L8 35 Z"
          fill={`url(#${id})`}
          stroke="#0d0a1a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative z-10 mt-1 font-display text-xs font-extrabold text-anime-ink md:text-sm">
        {rank}
      </span>
    </div>
  );
}
