import { GridTileImage } from "components/grid/tile";
import { getCollectionProducts } from "lib/shopify";
import type { Product } from "lib/shopify/types";
import Link from "next/link";
import { ReactNode } from "react";

type MaybeMockProduct = Product & {
  swatch?: [string, string];
  badge?: string;
};

export async function JustArrivedRow() {
  const products = (await getCollectionProducts({
    collection: "just-arrived",
  })) as MaybeMockProduct[];

  if (!products.length) return null;

  return (
    <SectionShell
      eyebrow="★ Fresh off the truck"
      title="Just arrived"
      ctaText="See all new →"
      ctaHref="/search"
    >
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
        {products.map((p) => (
          <li
            key={p.handle}
            className="relative aspect-square"
          >
            <Link
              href={`/product/${p.handle}`}
              className="relative block h-full w-full"
            >
              <GridTileImage
                src={p.featuredImage?.url || undefined}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
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
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export async function TopTenSection() {
  const products = (await getCollectionProducts({
    collection: "top-10",
  })) as MaybeMockProduct[];

  if (!products.length) return null;

  return (
    <SectionShell
      eyebrow="♛ Collector's choice"
      title="Top 10 picks"
      ctaText="See full chart →"
      ctaHref="/search"
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
        {products.slice(0, 10).map((p, i) => (
          <li
            key={p.handle}
            className="relative aspect-square min-h-[180px]"
          >
            <Link
              href={`/product/${p.handle}`}
              className="relative block h-full w-full"
            >
              <GridTileImage
                src={p.featuredImage?.url || undefined}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 50vw"
                alt={p.title}
                swatch={p.swatch}
                label={{
                  title: p.title,
                  amount: p.priceRange.maxVariantPrice.amount,
                  currencyCode: p.priceRange.maxVariantPrice.currencyCode,
                }}
              />
              <RankBadge rank={i + 1} />
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
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
          <li
            key={p.handle}
            className="relative aspect-square min-h-[200px]"
          >
            <Link
              href={`/product/${p.handle}`}
              className="relative block h-full w-full"
            >
              <GridTileImage
                src={p.featuredImage?.url || undefined}
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
  const isCrown = rank <= 3;
  return (
    <div
      className={
        "absolute -left-1.5 -top-1.5 z-30 flex h-8 w-8 -rotate-6 items-center justify-center rounded-full border-[2px] border-anime-ink font-display text-[13px] font-extrabold text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] " +
        (isCrown
          ? "bg-anime-yellow"
          : rank <= 6
            ? "bg-anime-pink text-white"
            : "bg-white")
      }
    >
      {isCrown ? `♛${rank}` : rank}
    </div>
  );
}
