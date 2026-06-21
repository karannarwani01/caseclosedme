import { GridTileImage } from "components/grid/tile";
import Footer from "components/layout/footer";
import { Gallery } from "components/product/gallery";
import { ProductDescription } from "components/product/product-description";
import { ProductReviews } from "components/product/product-reviews";
import { UpsellCarousel } from "components/product/upsell-carousel";
import Prose from "components/prose";
import { WishlistButton } from "components/wishlist/wishlist-button";
import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import {
  getProduct,
  getProductRecommendations,
  getProducts,
} from "lib/shopify";
import { getProductReviews } from "lib/shopify-admin";
import type { Image } from "lib/shopify/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const reviewData = await getProductReviews(product.handle);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="mx-auto w-full min-w-0 max-w-(--breakpoint-2xl) px-4 py-6 md:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Left column — one card holding the gallery and the long-form
              description (divider between), so it grows to match the buy box
              instead of leaving dead space below the image. */}
          <div className="w-full min-w-0 lg:basis-3/5">
            <div className="rounded-2xl border-[2.5px] border-anime-ink bg-[#fffcea] p-5 shadow-[6px_6px_0_0_var(--color-anime-ink)] md:p-6 lg:h-full">
              <Suspense
                fallback={
                  <div className="aspect-square w-full overflow-hidden rounded-2xl border-[2.5px] border-anime-ink bg-white" />
                }
              >
                <Gallery
                  images={product.images.map((image: Image) => ({
                    src: image.url,
                    altText: image.altText,
                  }))}
                />
              </Suspense>

              {product.descriptionHtml ? (
                <div className="relative mt-6 overflow-hidden rounded-2xl border-[2.5px] border-anime-ink bg-white p-5 shadow-[4px_4px_0_0_var(--color-anime-ink)] md:p-6">
                  {/* halftone corner accent */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, var(--color-anime-ink) 1.5px, transparent 2px)",
                      backgroundSize: "10px 10px",
                    }}
                  />
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 -rotate-6 place-items-center rounded-full border-[2.5px] border-anime-ink bg-anime-pink text-lg text-white shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                      ★
                    </span>
                    <h2 className="font-comic text-3xl leading-none tracking-wide text-anime-ink md:text-4xl">
                      <span className="relative inline-block">
                        <span className="relative z-10">The Details</span>
                        <span
                          aria-hidden
                          className="absolute bottom-0 left-0 z-0 h-2.5 w-full -rotate-1 rounded-sm bg-anime-yellow"
                        />
                      </span>
                    </h2>
                  </div>
                  <Prose
                    className="prose-onebox text-sm leading-relaxed text-anime-ink/80"
                    html={product.descriptionHtml}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Buy box — equal height with the left column so both bottoms line up. */}
          <div className="w-full min-w-0 lg:basis-2/5">
            <div className="rounded-2xl border-[2.5px] border-anime-ink bg-[#fffcea] p-6 shadow-[6px_6px_0_0_var(--color-anime-ink)] md:p-8 lg:h-full">
              <Suspense fallback={null}>
                <ProductDescription
                  product={product}
                  reviewCount={reviewData.count}
                  reviewAverage={reviewData.average}
                />
              </Suspense>
            </div>
          </div>
        </div>
        <ProductReviews
          productHandle={product.handle}
          reviews={reviewData.reviews}
          count={reviewData.count}
          average={reviewData.average}
        />
        <RelatedProducts id={product.id} />
      </div>
      <Footer />
    </>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const UPSELL_LIMIT = 16;
  const recs = await getProductRecommendations(id);

  // Top up with best-sellers when Shopify returns few recommendations, so the
  // upsell row always stays full (excluding the current product + dupes).
  const list = [...recs];
  if (list.length < UPSELL_LIMIT) {
    const seen = new Set(list.map((p) => p.handle));
    const fill = await getProducts({ sortKey: "BEST_SELLING" });
    for (const p of fill) {
      if (list.length >= UPSELL_LIMIT) break;
      if (p.id === id || seen.has(p.handle)) continue;
      seen.add(p.handle);
      list.push(p);
    }
  }
  const relatedProducts = list.slice(0, UPSELL_LIMIT);

  if (!relatedProducts.length) return null;

  return (
    <section className="mx-auto mt-14 w-full md:mt-20">
      <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10">
        <span className="inline-flex items-center rounded-full border-[2.5px] border-anime-ink bg-anime-lime px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] md:text-sm">
          ♛ Keep collecting
        </span>
        <h2 className="font-comic text-5xl leading-[0.95] tracking-wide text-anime-ink md:text-6xl lg:text-7xl">
          More like this
        </h2>
      </div>
      <UpsellCarousel>
        {relatedProducts.map((product) => (
          <li
            key={product.handle}
            className="relative aspect-square w-40 shrink-0 snap-start sm:w-48 lg:w-56"
          >
            <Link
              href={`/product/${product.handle}`}
              prefetch={true}
              className="relative block h-full w-full"
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
              />
            </Link>
            <WishlistButton product={product} variant="card" />
          </li>
        ))}
      </UpsellCarousel>
    </section>
  );
}
