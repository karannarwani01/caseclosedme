import { FeedCard } from "components/feed/feed-card";
import { Product } from "lib/shopify/types";

export default function ProductGridItems({
  products,
}: {
  products: Product[];
}) {
  return (
    <>
      {products.map((product) => (
        <li key={product.handle} className="animate-fadeIn">
          <FeedCard product={product} />
        </li>
      ))}
    </>
  );
}
