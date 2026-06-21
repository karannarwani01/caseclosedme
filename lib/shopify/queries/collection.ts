import productListingFragment from "../fragments/product-listing";
import seoFragment from "../fragments/seo";

const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    handle
    title
    description
    seo {
      ...seo
    }
    updatedAt
  }
  ${seoFragment}
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      ...collection
    }
  }
  ${collectionFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections {
    collections(first: 250, sortKey: TITLE) {
      edges {
        node {
          ...collection
        }
      }
    }
  }
  ${collectionFragment}
`;

// Minimal query for the mega-menu thumbnails: only the featured image URLs of a
// collection's first few products. Avoids pulling full product listings (price,
// variants, tags) just to show 4 images in the navbar on every page.
export const getCollectionFeaturedImagesQuery = /* GraphQL */ `
  query getCollectionFeaturedImages($handle: String!, $first: Int = 8) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            featuredImage {
              url
            }
          }
        }
      }
    }
  }
`;

// Lightweight probe: every collection with a single product edge, used to tell
// which collections are non-empty so the nav can hide empty ones.
export const getCollectionHandlesWithProductsQuery = /* GraphQL */ `
  query getCollectionHandlesWithProducts {
    collections(first: 250, sortKey: TITLE) {
      edges {
        node {
          handle
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int = 100
  ) {
    collection(handle: $handle) {
      products(sortKey: $sortKey, reverse: $reverse, first: $first) {
        edges {
          node {
            ...productListing
          }
        }
      }
    }
  }
  ${productListingFragment}
`;

// Cursor-paginated variant for the collection grid: caps the initial fetch and
// powers "Load more" via the returned endCursor/hasNextPage.
export const getCollectionProductsPageQuery = /* GraphQL */ `
  query getCollectionProductsPage(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int = 48
    $after: String
  ) {
    collection(handle: $handle) {
      products(
        sortKey: $sortKey
        reverse: $reverse
        first: $first
        after: $after
      ) {
        edges {
          node {
            ...productListing
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${productListingFragment}
`;
