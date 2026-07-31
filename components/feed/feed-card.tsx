import { QuickAddButton } from "components/cart/quick-add-button";
import { StarburstBadge } from "components/feed/starburst-badge";
import Price from "components/price";
import { SoldOutStamp } from "components/sold-out-stamp";
import { WishlistButton } from "components/wishlist/wishlist-button";
import { badgeForTags } from "lib/editorial";
import { seriesOf } from "lib/feed-facets";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";

const PLACEHOLDER_COLORS = [
  "var(--color-anime-pink)",
  "var(--color-anime-cyan)",
  "var(--color-anime-purple)",
  "var(--color-anime-lime)",
  "var(--color-anime-orange)",
  "var(--color-anime-yellow)",
];

function colorForHandle(handle: string) {
  let h = 0;
  for (let i = 0; i < handle.length; i++)
    h = (h * 31 + handle.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_COLORS[h % PLACEHOLDER_COLORS.length];
}

// Clean, photo-forward product card matching the reference catalogue:
// soft white tile, wishlist heart, comic burst badge, uppercase title,
// brand/series line, bold price.
export function FeedCard({ product }: { product: Product }) {
  const badge = badgeForTags(product.tags);
  const series = seriesOf(product);
  const soldOut = !product.availableForSale;

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        {badge ? (
          <StarburstBadge
            label={badge.label}
            bg={badge.bg}
            color={badge.color}
          />
        ) : null}

        <Link
          href={`/product/${product.handle}`}
          prefetch={true}
          className="relative block aspect-square overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
        >
          {product.featuredImage?.url ? (
            <Image
              src={product.featuredImage.url}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 33vw, 50vw"
              className={
                "object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.05]" +
                (soldOut ? " opacity-60 saturate-50" : "")
              }
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `radial-gradient(circle at 50% 42%, color-mix(in srgb, ${colorForHandle(product.handle)} 30%, white) 0 46%, white 72%)`,
              }}
            >
              <span className="font-display text-5xl font-extrabold text-anime-ink/85">
                {product.title
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .charAt(0)
                  .toUpperCase() || "?"}
              </span>
            </div>
          )}

          {soldOut ? <SoldOutStamp className="w-[78%]" /> : null}
        </Link>

        {/* Wishlist heart + quick add-to-cart (siblings of the Link so they
          aren't nested interactives). One treatment everywhere: the full-width
          pill across the card's bottom edge — always visible, aligned to the
          card. (The desktop corner sticker read as too small; the hover-only
          pill before that read as no add-to-cart at all.) */}
        <WishlistButton product={product} variant="card" />
        <QuickAddButton product={product} />
      </div>

      {/* Title block */}
      <div className="px-1 pt-3">
        <h3 className="line-clamp-2 min-h-[2.4em] font-display text-[13px] font-extrabold uppercase leading-tight tracking-[0.03em] text-anime-ink">
          {product.title}
        </h3>
        {series ? (
          <span className="mt-2 inline-block -rotate-1 rounded-full border-2 border-anime-ink bg-anime-cyan px-2.5 py-0.5 font-comic text-[10px] uppercase tracking-wide text-anime-ink shadow-[1.5px_1.5px_0_0_var(--color-anime-ink)]">
            {series}
          </span>
        ) : null}
        <div className="mt-2">
          <span className="inline-block rotate-1 rounded-md border-[2.5px] border-anime-ink bg-anime-lime px-2.5 py-0.5 shadow-[2px_2px_0_0_var(--color-anime-ink)]">
            <Price
              className="font-display text-base font-extrabold tabular-nums text-anime-ink"
              amount={product.priceRange.maxVariantPrice.amount}
              currencyCode={product.priceRange.maxVariantPrice.currencyCode}
            />
          </span>
        </div>
      </div>
    </article>
  );
}
