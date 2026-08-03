// Selling plans back subscriptions (Stripe Subscriptions app writes them as
// native Shopify selling plan groups). Deliberately NOT folded into
// `productFragment`: that fragment is also spread by getProducts(first: 250),
// the recommendations query and every cart line, so adding this there would
// multiply Storefront API query cost across the whole site. Only the PDP query
// pulls it.
const sellingPlanGroupFragment = /* GraphQL */ `
  fragment sellingPlanGroup on SellingPlanGroup {
    appName
    name
    options {
      name
      values
    }
    sellingPlans(first: 10) {
      edges {
        node {
          id
          name
          description
          recurringDeliveries
          priceAdjustments {
            adjustmentValue {
              ... on SellingPlanPercentagePriceAdjustment {
                adjustmentPercentage
              }
              ... on SellingPlanFixedAmountPriceAdjustment {
                adjustmentAmount {
                  amount
                  currencyCode
                }
              }
              ... on SellingPlanFixedPriceAdjustment {
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default sellingPlanGroupFragment;
