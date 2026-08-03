import productFragment from "../fragments/product";
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

export const getProductsQuery = /* GraphQL */ `
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 250) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${productFragment}
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...product
    }
  }
  ${productFragment}
`;
