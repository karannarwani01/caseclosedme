import {
  defaultSort,
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
import { after, NextRequest, NextResponse } from "next/server";
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
  getProductHandlesQuery,
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
  ShopifyProductHandlesOperation,
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

        // A 5xx/429 during a Shopify/Cloudflare incident often returns an HTML
        // error page. Turn that into a retryable transient error BEFORE trying
        // to JSON-parse it — otherwise result.json() throws a SyntaxError that
        // isTransientNetworkError doesn't recognise, so the retry never fires
        // and callers get a hard crash instead of one quiet retry.
        if (!result.ok && (result.status >= 500 || result.status === 429)) {
          throw new Error(`fetch failed: Shopify HTTP ${result.status}`);
        }

        let body: any;
        try {
          body = await result.json();
        } catch (parseErr) {
          // Non-JSON body (HTML error page, truncated response) — retryable.
          throw new Error(`fetch failed: non-JSON response (${result.status})`);
        }

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

const removeEdgesAndNodes = <T>(array: Connection<T> | null | undefined): T[] => {
  // Degrade to [] instead of throwing "Cannot read properties of undefined
  // (reading 'edges')" when a malformed 200 arrives with a null connection.
  return array?.edges?.map((edge) => edge?.node) ?? [];
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

  const { images, variants, media, sellingPlanGroups, ...rest } = product;

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
    // Only the PDP query selects this; everywhere else it stays undefined.
    sellingPlanGroups: sellingPlanGroups
      ? removeEdgesAndNodes(sellingPlanGroups).map((group) => ({
          ...group,
          sellingPlans: removeEdgesAndNodes(group.sellingPlans),
        }))
      : undefined,
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
  lines: { merchandiseId: string; quantity: number; sellingPlanId?: string }[],
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
  lines: {
    id: string;
    merchandiseId: string;
    quantity: number;
    sellingPlanId?: string;
  }[],
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
  // "use cache: private" is load-bearing, not a data cache: it is the Next 16
  // cacheComponents mechanism that lets the layout create this cookie-reading
  // promise without blocking the static shell (see bottom-tab-bar.tsx). With
  // cacheLife("seconds") the cart is re-read from Shopify effectively every
  // request; private entries are per-user and are not the shared ISR store
  // that the removed product/collection caches were writing to.
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
// product. Used by the nav to hide empty collections/menus. Tagged with both
// collections and products, so the Shopify webhook flushes it the moment stock
// changes; the "days" lifetime is only a backstop. (Was "hours": because the
// navbar is on every page, that pinned the whole homepage — ~600 KB per ISR
// write — to an hourly rewrite and burned most of the ISR write budget.)
export async function getNonEmptyCollectionHandles(): Promise<string[]> {
<<<<<<< HEAD
=======
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");
>>>>>>> 094d6929df11b9ca65ba155450b9d706c0309e93

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
<<<<<<< HEAD
=======
  "use cache";
  cacheTag(TAGS.collections);
  // Shopify has no menu webhook, and revalidate() only flushes on collection/
  // product edits — so a renamed/reordered nav item can stick for up to a day
  // (or until the next deploy). That's accepted: the menu is on every page, so
  // an "hours" lifetime forced an hourly ISR rewrite of the ~600 KB homepage
  // and drove the team towards the free-tier ISR write cap.
  cacheLife("days");
>>>>>>> 094d6929df11b9ca65ba155450b9d706c0309e93

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
<<<<<<< HEAD
=======
  "use cache";
  cacheTag(TAGS.collections);
  // Content pages change rarely; a day of staleness (or a redeploy) is fine and
  // avoids re-rendering every /[page] each hour.
  cacheLife("days");
>>>>>>> 094d6929df11b9ca65ba155450b9d706c0309e93

  // Was the only Shopify reader with no endpoint guard: with Shopify
  // unconfigured shopifyFetch throws and every /[page] (about, FAQ, policies)
  // 500s instead of 404ing. Undefined lets the route call notFound().
  if (!endpoint) return undefined as unknown as Page;

  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
<<<<<<< HEAD
=======
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");
>>>>>>> 094d6929df11b9ca65ba155450b9d706c0309e93

  if (!endpoint) return [];

  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(handle: string): Promise<Product | undefined> {

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

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return removeEdgesAndNodes(res.body.data.products)
    .map(reshapeListingProduct)
    .filter((p): p is Product => Boolean(p));
}

// Sitemap helper: walks every product page so stores with >250 products are
// fully listed. Only fetches handle + updatedAt, so it stays cheap.
export async function getAllProductHandles(): Promise<
  { handle: string; updatedAt: string }[]
> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const out: { handle: string; updatedAt: string }[] = [];
  let after: string | null = null;
  for (let i = 0; i < 40; i++) {
    const res: { body: ShopifyProductHandlesOperation } =
      await shopifyFetch<ShopifyProductHandlesOperation>({
        query: getProductHandlesQuery,
        variables: after ? { after } : {},
      });
    const conn = res.body.data.products;
    out.push(...conn.edges.map((e) => e.node));
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Webhook revalidation, debounced.
//
// A bulk edit in Shopify fires one products/update (and, via smart collections,
// one collections/update) webhook per product — 40+ within a minute. Each
// revalidateTag() used to mark the homepage stale, and every homepage rewrite
// costs ~60–80 ISR write units on Vercel (see the 17 Aug 2026 ISR-cap incident).
//
// Coalescing without a database: a "use cache" slot per tag acts as a lock with
// a hard expiry. The first webhook of a window populates the slot (it sees a
// fresh timestamp) and becomes the LEADER: it responds 200 to Shopify at once,
// then — via after() — sleeps REVALIDATE_DELAY_MS and revalidates the tag
// once. Every later webhook in the window reads the cached slot, sees it is
// not the author, and returns 200 without revalidating; edits arriving within
// the leader's 50s delay are covered by its flush, later ones wait for the
// window to expire (see trade-off below).
//
// The route exports maxDuration = 60 so the leader survives its sleep on Hobby.
// Keep REVALIDATE_DELAY_MS < maxDuration.
//
// The slot (300s) is deliberately much longer than the leader's 50s flush
// delay: it rate-limits flush waves to one per 5 minutes, because every wave
// costs ISR writes (re-primed catalogue entries + each page shell rewritten on
// its next visit) — the Aug 2026 Hobby-quota crunch. Trade-off: an edit that
// lands AFTER the leader's flush but inside the slot stays stale until the
// first webhook after the slot expires; sale/edit webhooks arrive all day, so
// gaps self-heal within minutes in practice.
// ---------------------------------------------------------------------------
const REVALIDATE_SLOT_SECONDS = 300;
const REVALIDATE_DELAY_MS = 50_000;
async function claimRevalidateSlot(tag: string): Promise<{ at: number }> {
  "use cache";
  cacheTag(`revalidate-slot:${tag}`);
  // revalidate === expire so the entry is never served stale-while-revalidate:
  // a background refresh would mint a leader timestamp nobody acts on.
  cacheLife({
    stale: 0,
    revalidate: REVALIDATE_SLOT_SECONDS,
    expire: REVALIDATE_SLOT_SECONDS,
  });
  return { at: Date.now() };
}

// Returns true when this request became the leader and scheduled the revalidate.
async function scheduleRevalidate(tag: string): Promise<boolean> {
  const startedAt = Date.now();
  const slot = await claimRevalidateSlot(tag);
  // Cache miss ⇒ the slot was minted during this call (at >= startedAt) ⇒ leader.
  // Cache hit ⇒ minted by an earlier webhook (at < startedAt) ⇒ follower.
  if (slot.at < startedAt) return false;
  after(async () => {
    await new Promise((r) => setTimeout(r, REVALIDATE_DELAY_MS));
    // "max": visitors keep getting the stale catalogue instantly while the
    // refresh runs in the background — "seconds" made every flush block the
    // next visitor on 1–2s Shopify round-trips (the "site is slow" reports).
    revalidateTag(tag, "max");
    console.log(`[revalidate] flushed tag "${tag}" after debounce window`);
    // Re-prime the hottest entries so the refresh happens on our dime, not a
    // shopper's: these cover search/browse feeds, the search overlay and the
    // PDP upsell fill. Failures are fine — the next request self-heals.
    await Promise.all([
      getProducts({}),
      getProducts({ sortKey: defaultSort.sortKey, reverse: defaultSort.reverse }),
      getProducts({ sortKey: "BEST_SELLING" }),
      getCollections(),
      getNonEmptyCollectionHandles(),
    ]).catch((e) => console.error("[revalidate] cache re-prime failed:", e));
  });
  return true;
}

// This is called from `app/api/revalidate/route.ts` so providers can control revalidation logic.
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

  const scheduled: string[] = [];
  const coalesced: string[] = [];
  const tag = isCollectionUpdate ? TAGS.collections : TAGS.products;
  ((await scheduleRevalidate(tag)) ? scheduled : coalesced).push(tag);

  return NextResponse.json({
    status: 200,
    revalidated: true,
    scheduled,
    coalesced,
    now: Date.now(),
  });
}
