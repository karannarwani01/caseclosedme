// Shopify Admin API client for writing refund requests into the store admin
// as app-owned metaobjects (type "$app:refund_request").
//
// The metaobject definition already exists in the store (created once during
// setup), so this only creates entries — which needs the write_metaobjects
// scope we hold. Server-only; never import into a client component.

const ADMIN_API_VERSION = "2026-04";
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "rje5fv-8c.myshopify.com";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";

const REFUND_TYPE = "$app:refund_request";

function adminEndpoint() {
  const host = STORE_DOMAIN.replace(/^https?:\/\//, "");
  return `https://${host}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
}

export function isAdminConfigured(): boolean {
  return Boolean(ADMIN_TOKEN);
}

export type RefundRecord = {
  summary: string;
  status: string;
  details: string;
};

// Create one Refund Request record in the Shopify admin.
export async function createRefundRequestRecord(
  record: RefundRecord,
): Promise<void> {
  if (!ADMIN_TOKEN) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is not set");

  const query = `mutation($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message code }
    }
  }`;
  const variables = {
    metaobject: {
      type: REFUND_TYPE,
      fields: [
        { key: "summary", value: record.summary },
        { key: "status", value: record.status },
        { key: "details", value: record.details },
      ],
    },
  };

  const res = await fetch(adminEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  const errs = json?.data?.metaobjectCreate?.userErrors;
  if (json.errors || (errs && errs.length)) {
    throw new Error(
      `Shopify metaobjectCreate failed: ${JSON.stringify(json.errors || errs)}`,
    );
  }
}
