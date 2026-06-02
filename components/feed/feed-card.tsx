import { StarburstBadge } from "components/feed/starburst-badge";
import Price from "components/price";
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
      {soldOut ? (
        <StarburstBadge
          label="Sold Out"
          bg="var(--color-anime-ink)"
          color="#fff"
        />
      ) : badge ? (
        <StarburstBadge label={badge.label} bg={badge.bg} color={badge.color} />
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

        {/* Wishlist heart */}
        <span
          aria-hidden
          className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/90 text-anime-ink/55 backdrop-blur-sm transition-colors group-hover:text-anime-pink"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 21s-7.5-4.6-10-9.2C.7 9 1.8 5.5 5 5c2-.3 3.4 1 4 2 .6-1 2-2.3 4-2 3.2.5 4.3 4 3 6.8C19.5 16.4 12 21 12 21z"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>

      {/* Title block */}
      <div className="px-1 pt-3">
        <h3 className="line-clamp-2 min-h-[2.4em] font-display text-[13px] font-extrabold uppercase leading-tight tracking-[0.03em] text-anime-ink">
          {product.title}
        </h3>
        {series ? (
          <p className="mt-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-anime-ink/45">
            {series}
          </p>
        ) : null}
        <Price
          className="mt-1 font-display text-[15px] font-extrabold tabular-nums text-anime-ink"
          amount={product.priceRange.maxVariantPrice.amount}
          currencyCode={product.priceRange.maxVariantPrice.currencyCode}
        />
      </div>
    </article>
  );
}
