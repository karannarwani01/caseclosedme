import {
  getCollection,
  getCollectionProducts,
  getNonEmptyCollectionHandles,
} from "lib/shopify";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeedBrowse } from "components/feed/feed-browse";
import { defaultSort, sorting } from "lib/constants";
import { filterDemoByCollection, USE_DEMO_PRODUCTS } from "lib/demo-products";

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
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
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

  // In demo mode, skip Shopify entirely — those calls throw without a
  // configured store and crash the server render.
  const [collection, products, availableHandles] = USE_DEMO_PRODUCTS
    ? [null, filterDemoByCollection(params.collection), [] as string[]]
    : await Promise.all([
        getCollection(params.collection),
        getCollectionProducts({
          collection: params.collection,
          sortKey,
          reverse,
        }),
        getNonEmptyCollectionHandles(),
      ]);

  const heading = collection?.title || params.collection;

  return (
    <FeedBrowse
      products={products}
      heading={heading}
      availableHandles={availableHandles}
    />
  );
}
