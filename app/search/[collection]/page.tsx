import {
  getCollection,
  getCollectionProductsPage,
  getNonEmptyCollectionHandles,
} from "lib/shopify";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeedBrowse } from "components/feed/feed-browse";
import { defaultSort, sorting } from "lib/constants";
import { filterDemoByCollection, USE_DEMO_PRODUCTS } from "lib/demo-products";
import { seoPageTitle } from "lib/seo-title";
import { baseUrl } from "lib/utils";
import type { Product } from "lib/shopify/types";
import { loadMoreCollectionProducts } from "./actions";

// Fetch the whole collection up front so the filter facets and filtering
// reflect every product, not just the first page. Rendering stays lazy —
// FeedBrowse only paints a page at a time via its own visibleCount. 250 is the
// Storefront API max per query; larger collections append the rest via
// "Load more".
const PAGE_SIZE = 250;

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  // In demo mode there is no live Shopify collection to look up, so build
  // metadata from the handle instead of 404ing the whole page.
  if (USE_DEMO_PRODUCTS) {
    const title = params.collection.replace(/-/g, " ");
    return {
      title,
      description: `${title} products`,
    };
  }

  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: seoPageTitle(collection.seo?.title, collection.title),
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
    // Sort and filter state lives in the query string; keep one indexable URL.
    alternates: { canonical: `/search/${params.collection}` },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Best Sellers is a catch-all collection — always rank it by sales and cap it
  // to a genuine top list rather than the whole catalogue.
  const isBestSellers = params.collection === "best-sellers";

  let products: Product[];
  let availableHandles: string[];
  let heading: string;
  let description = "";
  let initialCursor: string | null = null;
  let initialHasMore = false;

  if (USE_DEMO_PRODUCTS) {
    // Demo mode has no live Shopify collection; load the full mock set, no
    // pagination.
    products = filterDemoByCollection(params.collection);
    availableHandles = [];
    heading = params.collection;
  } else {
    // Best Sellers is a curated top-30 catch-all — fetch 30, don't paginate.
    const first = isBestSellers ? 30 : PAGE_SIZE;
    const [collection, page, handles] = await Promise.all([
      getCollection(params.collection),
      getCollectionProductsPage({
        collection: params.collection,
        sortKey: isBestSellers ? "BEST_SELLING" : sortKey,
        reverse: isBestSellers ? false : reverse,
        first,
      }),
      getNonEmptyCollectionHandles(),
    ]);
    products = page.products;
    availableHandles = handles;
    heading = collection?.title || params.collection;
    description = collection?.description || "";
    initialCursor = isBestSellers ? null : page.endCursor;
    initialHasMore = isBestSellers ? false : page.hasNextPage;
  }

  // CollectionPage + breadcrumb + a capped ItemList of the collection's
  // products. Collections had no structured data at all; they're the bulk of
  // the site's indexable URLs.
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: heading,
        url: `${baseUrl}/search/${params.collection}`,
        isPartOf: { "@id": `${baseUrl}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.slice(0, 20).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${baseUrl}/product/${p.handle}`,
            name: p.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: `${baseUrl}/search`,
          },
          { "@type": "ListItem", position: 3, name: heading },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <FeedBrowse
        key={params.collection}
        products={products}
        heading={heading}
        description={description}
        availableHandles={availableHandles}
        loadMore={
          USE_DEMO_PRODUCTS || isBestSellers
            ? undefined
            : loadMoreCollectionProducts
        }
        loadMoreArgs={{ collection: params.collection, sortKey, reverse }}
        initialCursor={initialCursor}
        initialHasMore={initialHasMore}
      />
    </>
  );
}
