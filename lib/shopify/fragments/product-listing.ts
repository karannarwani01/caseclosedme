import imageFragment from "./image";

// Trimmed product shape for listing/grid views (collections, search, feed
// rows). Only the fields the cards, facets, sorting and quick-add actually
// use — no descriptionHtml/description, full image array, seo or options, and
// variants capped low. Keeps the data serialized into client components small.
const productListingFragment = /* GraphQL */ `
  fragment productListing on Product {
    id
    handle
    availableForSale
    title
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      ...image
    }
    variants(first: 8) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          sku
        }
      }
    }
    tags
    productType
    vendor
    createdAt
  }
  ${imageFragment}
`;

export default productListingFragment;
