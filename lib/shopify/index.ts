import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "lib/constants";
import { isShopifyError } from "lib/type-guards";
import { ensureStartsWith } from "lib/utils";
import {
  getMockProductByHandle,
  getMockProductsForCollection,
} from "./mock-data";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { getCartQuery } from "./queries/cart";
import {
  getCollectionFeaturedImagesQuery,
  getCollectionHandlesWithProductsQuery,
  getCollectionProductsPageQuery,
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import {
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionFeaturedImagesOperation,
  ShopifyCollectionListingOperation,
  ShopifyCollectionListingPageOperation,
  ShopifyCollectionOperation,
  ShopifyCollectionsOperation,
  ShopifyListingProduct,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
} from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = domain ? `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}` : "";
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

// When false, the storefront shows only real Shopify products (no demo/mock
// fill-ins). Flip to "true" in .env.local to repopulate the demo catalogue.
const USE_DEMO_PRODUCTS = process.env.USE_DEMO_PRODUCTS === "true";

// Network resilience for calls to Shopify. A single request is capped at
// SHOPIFY_FETCH_TIMEOUT_MS; transient network failures (e.g. read ETIMEDOUT,
// dropped sockets) are retried with exponential backoff. GraphQL-level errors
// (body.errors) are NOT retried — retrying a bad query never helps.
const SHOPIFY_FETCH_TIMEOUT_MS = 10_000;
const SHOPIFY_FETCH_MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientNetworkError = (e: unknown): boolean => {
  if (!e || typeof e !== "object") return false;
  const err = e as {
    name?: string;
    code?: string;
    message?: string;
    cause?: unknown;
  };
  // AbortSignal.timeout() rejects with a TimeoutError/AbortError.
  if (err.name === "AbortError" || err.name === "TimeoutError") return true;
  const cause =
    err.cause && typeof err.cause === "object"
      ? (err.cause as { code?: string; message?: string })
      : {};
  const haystack =
    `${err.code ?? ""} ${err.message ?? ""} ` +
    `${cause.code ?? ""} ${cause.message ?? ""} ${typeof err.cause === "string" ? err.cause : ""}`;
  return /fetch failed|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EPIPE|EAI_AGAIN|UND_ERR|socket hang up/i.test(
    haystack,
  );
};

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function shopifyFetch<T>({
  headers,
  query,
  variables,
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    if (!endpoint) {
      throw new Error("SHOPIFY_STORE_DOMAIN environment variable is not set");
    }

    const requestBody = JSON.stringify({
      ...(query && { query }),
      ...(variables && { variables }),
    });

    let lastError: unknown;
    for (let attempt = 0; attempt <= SHOPIFY_FETCH_MAX_RETRIES; attempt++) {
      try {
        const result = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": key,
            ...headers,
          },
          body: requestBody,
          signal: AbortSignal.timeout(SHOPIFY_FETCH_TIMEOUT_MS),
        });

        const body = await result.json();

        if (body.errors) {
          // quantityAvailable is requested by the product fragments but the
          // Storefront token may not have the inventory scope yet. Shopify
          // then returns the FULL data payload with the field nulled, plus an
          // access-denied error alongside it. Treat exactly that case as
          // success (the null field is handled downstream); the moment the
          // scope is granted on the Headless channel the error disappears and
          // stock numbers flow — no code change needed. Anything else throws
          // as before.
          const realErrors = (body.errors as { message?: string }[]).filter(
            (e) => !(e.message ?? "").includes("quantityAvailable"),
          );
          if (realErrors.length > 0 || !body.data) {
            throw body.errors[0];
          }
        }

        return {
          status: result.status,
          body,
        };
      } catch (e) {
        lastError = e;
        // Only transient network blips are worth retrying; GraphQL errors and
        // anything non-transient bubble straight out to the shaping below.
        if (attempt < SHOPIFY_FETCH_MAX_RETRIES && isTransientNetworkError(e)) {
          await sleep(250 * 2 ** attempt); // 250ms, then 500ms
          continue;
        }
        throw e;
      }
    }

    // Unreachable in practice (loop either returns or throws), but satisfies
    // the type checker and guards against a misconfigured retry count.
    throw lastError;
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: cart.cost.totalAmount.currencyCode,
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines),
  };
};

const reshapeCollection = (
  collection: ShopifyCollection,
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`,
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`,
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true,
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, media, ...rest } = product;

  const model3dUrl = media
    ? removeEdgesAndNodes(media)
        .find((m) => m.mediaContentType === "MODEL_3D")
        ?.sources?.find((s) => s.format === "glb")?.url
    : undefined;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
    model3dUrl,
  };
};

// Reshape a trimmed listing node into a full Product, filling the fields the
// listing fragment intentionally omits (description/options/seo/images) with
// safe defaults so cards, facets and quick-add work unchanged.
const reshapeListingProduct = (
  p: ShopifyListingProduct,
): Product | undefined => {
  if (!p || p.tags.includes(HIDDEN_PRODUCT_TAG)) return undefined;
  return {
    id: p.id,
    handle: p.handle,
    availableForSale: p.availableForSale,
    title: p.title,
    description: "",
    descriptionHtml: "",
    options: [],
    priceRange: p.priceRange,
    compareAtPriceRange: p.compareAtPriceRange,
    featuredImage: p.featuredImage,
    images: p.featuredImage ? [p.featuredImage] : [],
    variants: removeEdgesAndNodes(p.variants),
    seo: { title: p.title, description: "" },
    tags: p.tags,
    productType: p.productType,
    vendor: p.vendor,
    createdAt: p.createdAt,
    updatedAt: p.createdAt,
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

function emptyMockCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    cost: {
      subtotalAmount: { amount: "0.00", currencyCode: "USD" },
      totalAmount: { amount: "0.00", currencyCode: "USD" },
      totalTaxAmount: { amount: "0.00", currencyCode: "USD" },
    },
    lines: [],
    totalQuantity: 0,
  };
}

export async function createCart(): Promise<Cart> {
  if (!endpoint) {
    return emptyMockCart();
  }
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  if (!endpoint) {
    return emptyMockCart();
  }
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  if (!endpoint) {
    return emptyMockCart();
  }
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
    },
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  if (!endpoint) {
    return emptyMockCart();
  }
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
    },
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  "use cache: private";
  cacheTag(TAGS.cart);
  cacheLife("seconds");

  if (!endpoint) {
    return undefined;
  }

  const cartId = (await cookies()).get("cartId")?.value;

  if (!cartId) {
    return undefined;
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId },
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
  first,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
  // How many products to pull. Defaults to 100 (full listing/filter views).
  // Homepage rows and the navbar pass a small limit to avoid over-fetching a
  // whole collection just to render a handful of tiles.
  first?: number;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  if (!endpoint) {
    return USE_DEMO_PRODUCTS ? getMockProductsForCollection(collection) : [];
  }

  const res = await shopifyFetch<ShopifyCollectionListingOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      ...(first != null ? { first } : {}),
    },
  });

  // When the collection is missing, fall back to mock products only in demo
  // mode; otherwise return an empty set so the row simply doesn't render.
  if (!res.body.data.collection) {
    return USE_DEMO_PRODUCTS ? getMockProductsForCollection(collection) : [];
  }

  const products = removeEdgesAndNodes(res.body.data.collection.products)
    .map(reshapeListingProduct)
    .filter((p): p is Product => Boolean(p));
  if (products.length) return products;
  return USE_DEMO_PRODUCTS ? getMockProductsForCollection(collection) : [];
}

// Cursor-paginated collection fetch backing the grid's "Load more". Lets the
// collection page cap the initial fetch (e.g. first: 48) and pull subsequent
// pages on demand instead of serializing the whole collection up front.
export async function getCollectionProductsPage({
  collection,
  reverse,
  sortKey,
  first = 48,
  after,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
  first?: number;
  after?: string | null;
}): Promise<{
  products: Product[];
  endCursor: string | null;
  hasNextPage: boolean;
}> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const empty = { products: [], endCursor: null, hasNextPage: false };

  if (!endpoint) {
    return USE_DEMO_PRODUCTS
      ? { ...empty, products: getMockProductsForCollection(collection) }
      : empty;
  }

  const res = await shopifyFetch<ShopifyCollectionListingPageOperation>({
    query: getCollectionProductsPageQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      first,
      ...(after ? { after } : {}),
    },
  });

  const coll = res.body.data.collection;
  if (!coll) {
    return USE_DEMO_PRODUCTS
      ? { ...empty, products: getMockProductsForCollection(collection) }
      : empty;
  }

  const products = removeEdgesAndNodes(coll.products)
    .map(reshapeListingProduct)
    .filter((p): p is Product => Boolean(p));

  return {
    products,
    endCursor: coll.products.pageInfo.endCursor,
    hasNextPage: coll.products.pageInfo.hasNextPage,
  };
}

// Featured image URLs for a collection's first products — used by the mega-menu
// thumbnails. Tiny payload vs getCollectionProducts (no variants/price/tags).
export async function getCollectionFeaturedImageUrls(
  collection: string,
  { first = 8, take = 4 }: { first?: number; take?: number } = {},
): Promise<string[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const fromProducts = (products: Product[]) =>
    products
      .map((p) => p.featuredImage?.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, take);

  if (!endpoint) {
    return USE_DEMO_PRODUCTS
      ? fromProducts(getMockProductsForCollection(collection))
      : [];
  }

  const res = await shopifyFetch<ShopifyCollectionFeaturedImagesOperation>({
    query: getCollectionFeaturedImagesQuery,
    variables: { handle: collection, first },
  });

  const coll = res.body.data.collection;
  if (!coll) {
    return USE_DEMO_PRODUCTS
      ? fromProducts(getMockProductsForCollection(collection))
      : [];
  }

  return removeEdgesAndNodes(coll.products)
    .map((n) => n.featuredImage?.url)
    .filter((u): u is string => Boolean(u))
    .slice(0, take);
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log("Skipping getCollections - Shopify not configured");
    return [
      {
        handle: "",
        title: "All",
        description: "All products",
        seo: {
          title: "All",
          description: "All products",
        },
        path: "/search",
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery,
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: new Date().toISOString(),
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    // `still-good*` is hidden from all listings (search box, collections sidebar,
    // sitemap) but stays reachable at its direct /search/still-good URL.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) =>
        !collection.handle.startsWith("hidden") &&
        !collection.handle.startsWith("still-good"),
    ),
  ];

  return collections;
}

// Handles of every collection that currently has at least one published
// product. Used by the nav to hide empty collections/menus. Cached for hours
// so newly-stocked collections surface without a deploy.
export async function getNonEmptyCollectionHandles(): Promise<string[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("hours");

  if (!endpoint) return [];

  const res = await shopifyFetch<{
    data: {
      collections: {
        edges: {
          node: { handle: string; products: { edges: unknown[] } };
        }[];
      };
    };
  }>({
    query: getCollectionHandlesWithProductsQuery,
  });

  return removeEdgesAndNodes(res.body.data.collections)
    .filter((node) => node.products.edges.length > 0)
    .map((node) => node.handle);
}

// Shopify returns menu URLs as absolute links on the store's PRIMARY domain,
// which is shop.caseclosedme.com — not the .myshopify.com domain we call the
// API on. Stripping only SHOPIFY_STORE_DOMAIN therefore left the origin in
// place, and every Shopify-sourced nav link pointed at
// shop.caseclosedme.com/search/... That 404s on Shopify and only reaches the
// right page because the bounce theme redirects, costing a cross-domain round
// trip and showing crawlers a 404. Take the pathname so any origin is dropped,
// whichever domain Shopify decides to hand back.
function menuPath(url: string): string {
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    // Already relative — use as-is.
  }
  return path.replace("/collections", "/search").replace("/pages", "");
}

export async function getMenu(handle: string): Promise<Menu[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log(`Skipping getMenu for '${handle}' - Shopify not configured`);
    return [];
  }

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  return (
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: menuPath(item.url),
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  if (!endpoint) {
    return USE_DEMO_PRODUCTS ? getMockProductByHandle(handle) : undefined;
  }

  // Look up the real product. Stay resilient (never 500 on a bad/missing
  // handle); fall back to a mock product only in demo mode, otherwise return
  // undefined so the route renders a proper 404.
  try {
    const res = await shopifyFetch<ShopifyProductOperation>({
      query: getProductQuery,
      variables: {
        handle,
      },
    });
    const product = reshapeProduct(res.body.data.product, false);
    if (product) return product;
  } catch (e) {
    console.error(`getProduct('${handle}') Shopify lookup failed:`, e);
  }

  return USE_DEMO_PRODUCTS ? getMockProductByHandle(handle) : undefined;
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  // Mock products (id "mock/…") and demo stores won't resolve recommendations;
  // never let that 500 the product page — just show no related row.
  try {
    const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
      query: getProductRecommendationsQuery,
      variables: {
        productId,
      },
    });
    return reshapeProducts(res.body.data.productRecommendations);
  } catch (e) {
    console.error(`getProductRecommendations('${productId}') failed:`, e);
    return [];
  }
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, "seconds");
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, "seconds");
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
