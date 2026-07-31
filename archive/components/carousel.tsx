import { getCollectionProducts } from "lib/shopify";
import type { Product } from "lib/shopify/types";
import Link from "next/link";
import { GridTileImage } from "./grid/tile";

type MaybeMockProduct = Product & {
  swatch?: [string, string];
  badge?: string;
};

export async function Carousel() {
  // Curated marquee — triples a small set to scroll. Cap the fetch so we never
  // pull a whole collection just to loop a highlight reel.
  const products = (await getCollectionProducts({
    collection: "hidden-homepage-carousel",
    first: 12,
  })) as MaybeMockProduct[];

  if (!products?.length) return null;

  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-hidden pb-8 pt-2">
      <ul className="flex animate-carousel gap-4 w-max">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="relative aspect-square h-[30vh] max-h-[275px] min-h-[220px] w-auto flex-none"
          >
            <Link
              href={`/product/${product.handle}`}
              className="relative block h-full"
              style={{ aspectRatio: "1 / 1" }}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                }}
                src={product.featuredImage?.url ?? ""}
                swatch={product.swatch}
                badge={product.badge}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
