import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import Prose from "components/prose";
import { WishlistButton } from "components/wishlist/wishlist-button";
import { Product } from "lib/shopify/types";
import { ReviewsAccordion } from "./reviews-accordion";
import { ShareRow } from "./share-row";
import { StockBar } from "./stock-bar";
import { TrustBadges } from "./trust-badges";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({ product }: { product: Product }) {
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
        <Price
          className="mr-auto rotate-[-2deg] rounded-full border-[2.5px] border-anime-ink bg-anime-lime px-4 py-1.5 font-display text-xl font-extrabold tabular-nums text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)]"
          amount={amount}
          currencyCode={currencyCode}
        />
      </div>

      <StockBar available={product.availableForSale} quantity={totalQty} />

      <VariantSelector options={product.options} variants={product.variants} />

      <div className="flex flex-col gap-3">
        <AddToCart product={product} />
        <WishlistButton product={product} variant="detail" />
      </div>

      <TrustBadges />

      {product.descriptionHtml ? (
        <Prose
          className="prose-onebox text-sm leading-relaxed text-anime-ink/80"
          html={product.descriptionHtml}
        />
      ) : null}

      <ReviewsAccordion title={product.title} />

      <ShareRow title={product.title} />
    </div>
  );
}
