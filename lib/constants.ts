export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE";
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: "Relevance",
  slug: null,
  sortKey: "RELEVANCE",
  reverse: false,
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: "Trending",
    slug: "trending-desc",
    sortKey: "BEST_SELLING",
    reverse: false,
  }, // asc
  {
    title: "Latest arrivals",
    slug: "latest-desc",
    sortKey: "CREATED_AT",
    reverse: true,
  },
  {
    title: "Price: Low to high",
    slug: "price-asc",
    sortKey: "PRICE",
    reverse: false,
  }, // asc
  {
    title: "Price: High to low",
    slug: "price-desc",
    sortKey: "PRICE",
    reverse: true,
  },
];

export const TAGS = {
  collections: "collections",
  products: "products",
  cart: "cart",
};

export const HIDDEN_PRODUCT_TAG = "nextjs-frontend-hidden";
export const DEFAULT_OPTION = "Default Title";
// 2023-01 was retired long ago; Shopify silently routed those calls to the
// oldest *supported* version, so behavior could shift under us on Shopify's
// schedule. Pin the version we were already effectively running.
export const SHOPIFY_GRAPHQL_API_ENDPOINT = "/api/2025-07/graphql.json";

// Single source of truth for customer login/account. Points at Shopify's hosted
// "New Customer Accounts" (login, order history, profile) — confirmed live as the
// shop's customerAccountsV2 URL. Visiting it while logged out shows the login
// screen. Override per-environment with SHOPIFY_ACCOUNT_URL if the shop id changes.
export const ACCOUNT_URL =
  process.env.SHOPIFY_ACCOUNT_URL || "https://shopify.com/71115997383/account";

// Official social profiles — single source of truth for footer icons, JSON-LD
// sameAs and any "follow us" links. The Facebook page has no vanity handle yet,
// so it's the numeric profile URL.
export const INSTAGRAM_URL = "https://www.instagram.com/caseclosed.me";
export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61592783584526";
export const TIKTOK_URL = "https://www.tiktok.com/@caseclosedme";

// Only checkout on the site mints a Shopify order number — orders taken in
// Instagram/Facebook/TikTok/WhatsApp DMs have none, so the refund form makes
// its order-number field optional for every other platform. Shared by the form
// (client) and its server action so the two can't drift apart.
export const WEBSITE_PURCHASE_PLATFORM = "caseclosedme.com";
