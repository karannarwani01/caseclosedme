import { FeedBrowse } from "components/feed/feed-browse";
import { defaultSort, sorting } from "lib/constants";
import { DEMO_PRODUCTS, USE_DEMO_PRODUCTS } from "lib/demo-products";
import { getProducts } from "lib/shopify";

export const metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const products = USE_DEMO_PRODUCTS
    ? DEMO_PRODUCTS
    : await getProducts({ sortKey, reverse, query: searchValue });

  return (
    <FeedBrowse
      products={products}
      heading={searchValue ? `Results for “${searchValue}”` : undefined}
    />
  );
}
