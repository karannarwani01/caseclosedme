"use server";

import { getCollectionProductsPage } from "lib/shopify";
import type { Product } from "lib/shopify/types";

// Server action behind the collection grid's "Load more" button: fetches the
// next cursor page of a collection using the same sort as the initial render.
export async function loadMoreCollectionProducts(input: {
  collection: string;
  sortKey?: string;
  reverse?: boolean;
  after: string;
}): Promise<{
  products: Product[];
  endCursor: string | null;
  hasNextPage: boolean;
}> {
  return getCollectionProductsPage({
    collection: input.collection,
    sortKey: input.sortKey,
    reverse: input.reverse,
    after: input.after,
    first: 48,
  });
}
