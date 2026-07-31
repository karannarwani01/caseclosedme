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

export type AccountAddress = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  territoryCode: string | null;
  phoneNumber: string | null;
  isDefault: boolean;
};

export type AccountData = {
  /** Shopify customer GID. The only trustworthy source of who is signed in —
   *  never take this from the client when writing back to the customer. */
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  orders: AccountOrder[];
  addresses: AccountAddress[];
};

const QUERY = `query AccountDashboard {
  customer {
    id
    firstName
    lastName
    emailAddress { emailAddress }
    defaultAddress { id }
    addresses(first: 10) {
      edges {
        node {
          id
          firstName
          lastName
          address1
          address2
          city
          zip
          territoryCode
          phoneNumber
        }
      }
    }
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

// Run any operation against the Customer Account API with the visitor's own
// access token. Auth header is the raw token — no Bearer prefix.
export async function customerGraphQL<T = unknown>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
        "User-Agent": "caseclosed-account/1.0",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as T) ?? null;
  } catch {
    return null;
  }
}

// Query the customer's own profile + recent orders. Returns null on any failure
// so callers can degrade gracefully (the dashboard still renders identity from
// the session).
export async function fetchAccountData(
  accessToken: string,
): Promise<AccountData | null> {
  type Raw = {
    customer: {
      id: string | null;
      firstName: string | null;
      lastName: string | null;
      emailAddress: { emailAddress: string | null } | null;
      defaultAddress: { id: string } | null;
      addresses: {
        edges: { node: Omit<AccountAddress, "isDefault"> }[];
      } | null;
      orders: {
        edges: {
          node: {
            id: string;
            name: string;
            processedAt: string | null;
            fulfillmentStatus: string | null;
            totalPrice: { amount: string; currencyCode: string } | null;
          };
        }[];
      } | null;
    } | null;
  };

  const data = await customerGraphQL<Raw>(accessToken, QUERY);
  const c = data?.customer;
  if (!c) return null;

  const orders: AccountOrder[] = (c.orders?.edges ?? []).map((e) => ({
    id: e.node.id,
    name: e.node.name,
    processedAt: e.node.processedAt,
    total: e.node.totalPrice,
    status: e.node.fulfillmentStatus ?? null,
  }));

  const defaultId = c.defaultAddress?.id ?? null;
  const addresses: AccountAddress[] = (c.addresses?.edges ?? []).map((e) => ({
    ...e.node,
    isDefault: e.node.id === defaultId,
  }));

  return {
    id: c.id ?? null,
    firstName: c.firstName ?? null,
    lastName: c.lastName ?? null,
    email: c.emailAddress?.emailAddress ?? null,
    orders,
    addresses,
  };
}

// Create an address on the signed-in customer. Validated against the Customer
// Account API schema; works with the customer-account-api:full scope the login
// flow already requests — no Admin scope involved.
export async function createCustomerAddress(
  accessToken: string,
  address: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    zip?: string;
    phoneNumber?: string;
    territoryCode: string;
  },
  makeDefault: boolean,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  type Res = {
    customerAddressCreate: {
      customerAddress: { id: string } | null;
      userErrors: { field: string[] | null; message: string }[];
    } | null;
  };
  const data = await customerGraphQL<Res>(
    accessToken,
    `mutation AddAddress($address: CustomerAddressInput!, $defaultAddress: Boolean) {
      customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
        customerAddress { id }
        userErrors { field message }
      }
    }`,
    { address, defaultAddress: makeDefault },
  );
  const r = data?.customerAddressCreate;
  if (!r) return { ok: false, error: "request failed" };
  if (r.userErrors?.length)
    return { ok: false, error: r.userErrors[0]!.message };
  if (!r.customerAddress?.id)
    return { ok: false, error: "no address returned" };
  return { ok: true, id: r.customerAddress.id };
}
