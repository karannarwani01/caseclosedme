// Thin client for the Shopify Customer Account API (GraphQL). The endpoint was
// resolved from the shop's discovery doc (.well-known/customer-account-api) and
// is versioned; bump the version string when upgrading.
const ENDPOINT =
  "https://shopify.com/71115997383/account/customer/api/2026-04/graphql";

export type AccountOrder = {
  id: string;
  name: string;
  processedAt: string | null;
  total: { amount: string; currencyCode: string } | null;
  status: string | null;
};

export type AccountData = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  orders: AccountOrder[];
};

const QUERY = `query AccountDashboard {
  customer {
    firstName
    lastName
    emailAddress { emailAddress }
    orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          id
          name
          processedAt
          fulfillmentStatus
          totalPrice { amount currencyCode }
        }
      }
    }
  }
}`;

// Query the customer's own profile + recent orders. Returns null on any failure
// so callers can degrade gracefully (the dashboard still renders identity from
// the session).
export async function fetchAccountData(
  accessToken: string,
): Promise<AccountData | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
        "User-Agent": "caseclosed-account/1.0",
      },
      body: JSON.stringify({ query: QUERY }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const c = json?.data?.customer;
    if (!c) return null;
    const orders: AccountOrder[] = (c.orders?.edges ?? []).map(
      (e: {
        node: {
          id: string;
          name: string;
          processedAt: string | null;
          fulfillmentStatus: string | null;
          totalPrice: { amount: string; currencyCode: string } | null;
        };
      }) => ({
        id: e.node.id,
        name: e.node.name,
        processedAt: e.node.processedAt,
        total: e.node.totalPrice,
        status: e.node.fulfillmentStatus ?? null,
      }),
    );
    return {
      firstName: c.firstName ?? null,
      lastName: c.lastName ?? null,
      email: c.emailAddress?.emailAddress ?? null,
      orders,
    };
  } catch {
    return null;
  }
}
