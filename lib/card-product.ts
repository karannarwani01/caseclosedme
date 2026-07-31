import type { Product } from "lib/shopify/types";

// Strip a product down to what card-level client components actually consume.
//
// Why: everything passed as a prop to a "use client" component is serialized
// into the page's flight payload. The homepage was shipping 22 FULL products —
// descriptionHtml, image galleries, seo, every variant — for tiles whose
// client needs are a title, a photo, a price and one purchasable variant.
// That JSON was 44% of a 415KB homepage, which mobile LCP paid for on 4G.
//
// The result still satisfies the Product type (heavy fields become cheap
// empties, mirroring reshapeListingProduct's defaults) so no component
// signatures change. Consumers:
//   - QuickAddButton: availableForSale + first available variant (id, title,
//     price, selectedOptions, quantityAvailable)
//   - optimistic cart line: product id/handle/title/featuredImage + variant
//   - WishlistButton: handle/title/featuredImage/priceRange
export function toCardProduct(p: Product): Product {
  const v = p.variants.find((x) => x.availableForSale) ?? p.variants[0] ?? null;

  return {
    id: p.id,
    handle: p.handle,
    availableForSale: p.availableForSale,
    title: p.title,
    description: "",
    descriptionHtml: "",
    options: [],
    priceRange: p.priceRange,
    variants: v
      ? [
          {
            id: v.id,
            title: v.title,
            availableForSale: v.availableForSale,
            selectedOptions: v.selectedOptions,
            price: v.price,
            quantityAvailable: v.quantityAvailable ?? null,
          },
        ]
      : [],
    featuredImage: p.featuredImage,
    images: [],
    seo: { title: "", description: "" },
    tags: [],
    productType: p.productType,
    vendor: "",
    createdAt: "",
    updatedAt: "",
  };
}
