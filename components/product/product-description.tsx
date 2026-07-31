import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import { WishlistButton } from "components/wishlist/wishlist-button";
import { Product } from "lib/shopify/types";
import { ShareRow } from "./share-row";
import { Stars } from "./stars";
import { StockBar } from "./stock-bar";
import { TrustBadges } from "./trust-badges";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({
  product,
  reviewCount = 0,
  reviewAverage = 0,
}: {
  product: Product;
  reviewCount?: number;
  reviewAverage?: number;
}) {
  const amount = product.priceRange.maxVariantPrice.amount;
  const currencyCode = product.priceRange.maxVariantPrice.currencyCode;
  const sku = product.variants.find((v) => v.sku)?.sku;

  // Sum live inventory across variants when the storefront exposes it.
  const qtys = product.variants
    .map((v) => v.quantityAvailable)
    .filter((q): q is number => typeof q === "number");
  const totalQty = qtys.length ? qtys.reduce((a, b) => a + b, 0) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border-b-[2.5px] border-anime-ink pb-6">
        {product.vendor ? (
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-anime-ink/50">
            {product.vendor}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-anime-ink md:text-4xl">
          {product.title}
        </h1>
        {sku ? (
          <p className="font-display text-xs font-bold uppercase tracking-wide text-anime-ink/50">
            {sku}
          </p>
        ) : null}
        {reviewCount > 0 ? (
          <a
            href="#reviews"
            className="flex w-fit items-center gap-2 transition-opacity hover:opacity-70"
          >
            <Stars value={reviewAverage} className="h-4 w-4" />
            <span className="font-display text-xs font-extrabold text-anime-ink/70">
              {reviewAverage.toFixed(1)} · {reviewCount} review
              {reviewCount === 1 ? "" : "s"}
            </span>
          </a>
        ) : null}
        <div className="mr-auto flex flex-col items-start gap-1">
          <Price
            className="rotate-[-2deg] rounded-full border-[2.5px] border-anime-ink bg-anime-lime px-4 py-1.5 font-display text-xl font-extrabold tabular-nums text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)]"
            amount={amount}
            currencyCode={currencyCode}
          />
          {/* Prices are tax-inclusive storewide (shop.taxesIncluded=true). */}
          <span className="pl-2 font-comic text-[11px] uppercase tracking-wide text-anime-ink/50">
            VAT included
          </span>
        </div>
      </div>

      <StockBar available={product.availableForSale} quantity={totalQty} />

      <VariantSelector options={product.options} variants={product.variants} />

      <div className="flex flex-col gap-3">
        <AddToCart product={product} />
        <WishlistButton product={product} variant="detail" />
      </div>

      <TrustBadges />

      <ShareRow title={product.title} />
    </div>
  );
}
