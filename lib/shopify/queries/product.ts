import productFragment from "../fragments/product";
import productListingFragment from "../fragments/product-listing";
import sellingPlanGroupFragment from "../fragments/selling-plan";

// Only the PDP asks for selling plan groups — see the note in
// fragments/selling-plan.ts for why it isn't part of `productFragment`.
export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
      sellingPlanGroups(first: 5) {
        edges {
          node {
            ...sellingPlanGroup
          }
        }
      }
    }
  }
  ${productFragment}
  ${sellingPlanGroupFragment}
`;

// Listing fragment, not the full product: every getProducts consumer renders
// cards (feed, search, upsell fill), and the full-catalogue payload has to fit
// Vercel's per-item data-cache cap or it silently degrades to per-instance
// memory — every cold lambda then re-pays the ~1–2s Shopify query.
export const getProductsQuery = /* GraphQL */ `
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 250) {
      edges {
        node {
          ...productListing
        }
      }
    }
  }
  ${productListingFragment}
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...product
    }
  }
  ${productFragment}
`;

// Sitemap-only: every product handle + updatedAt, paginated past the 250 cap.
export const getProductHandlesQuery = /* GraphQL */ `
  query getProductHandles($after: String) {
    products(first: 250, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;
