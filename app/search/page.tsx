import { CategoryMatches } from "components/feed/category-matches";
import { FeedBrowse } from "components/feed/feed-browse";
import { defaultSort, sorting } from "lib/constants";
import { DEMO_PRODUCTS, USE_DEMO_PRODUCTS } from "lib/demo-products";
import {
  getCollections,
  getNonEmptyCollectionHandles,
  getProducts,
} from "lib/shopify";

export const metadata = {
  title: "Search",
  description:
    "Search the full caseclosed catalogue — Funko Pops, Pop Mart Labubu, anime figures, blind boxes and trading cards.",
  openGraph: {
    type: "website",
    siteName: "caseclosed",
    url: "/search",
    images: ["/opengraph-image"],
    title: "Search",
    description:
      "Search the full caseclosed catalogue — Funko Pops, Pop Mart Labubu, anime figures, blind boxes and trading cards.",
  },
  // ?q= and ?sort= would otherwise spawn an unbounded set of indexable URLs.
  alternates: { canonical: "/search" },
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // The three Shopify reads are independent — fetch them concurrently so a
  // cold cache costs one round-trip, not three back to back.
  const [allProducts, allCollections, availableHandles] = USE_DEMO_PRODUCTS
    ? [DEMO_PRODUCTS, [], []]
    : await Promise.all([
        getProducts({ sortKey, reverse }),
        searchValue ? getCollections() : [],
        getNonEmptyCollectionHandles(),
      ]);

  // Match the query against title, type, vendor, handle AND every tag/keyword,
  // so products are findable by any tag (character, franchise, colour,
  // exclusivity, etc.) — not just their title. All tokens must match (AND).
  let products = allProducts;
  if (searchValue) {
    // Normalize away hyphens so "die-cast" matches the "diecast" tag, etc.
    const norm = (s: string) => s.toLowerCase().replace(/-/g, "");
    const tokens = searchValue.split(/\s+/).filter(Boolean).map(norm);
    products = allProducts.filter((p) => {
      const haystack = norm(
        [p.title, p.productType, p.vendor, p.handle, ...p.tags].join(" "),
      );
      return tokens.every((t) => haystack.includes(t));
    });
  }

  // Also match the query against category names so every collection in the
  // framework is findable from the search box, not just products.
  let categoryMatches: Awaited<ReturnType<typeof getCollections>> = [];
  if (searchValue) {
    const q = searchValue.toLowerCase();
    categoryMatches = allCollections
      .filter((c) => c.handle && c.handle !== "frontpage")
      .filter((c) => c.title.toLowerCase().includes(q) || c.handle.includes(q))
      .slice(0, 12);
  }

  return (
    <>
      <CategoryMatches matches={categoryMatches} />
      <FeedBrowse
        products={products}
        heading={searchValue ? `Results for “${searchValue}”` : undefined}
        availableHandles={availableHandles}
      />
    </>
  );
}
