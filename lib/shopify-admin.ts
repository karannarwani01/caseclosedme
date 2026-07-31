// Shopify Admin API client for writing refund requests into the store admin
// as app-owned metaobjects (type "$app:refund_request"), including photo
// uploads to Shopify Files. Server-only; never import into a client component.

import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

const ADMIN_API_VERSION = "2026-04";
const STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN || "rje5fv-8c.myshopify.com";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";

const REFUND_TYPE = "$app:refund_request";

function adminEndpoint() {
  const host = STORE_DOMAIN.replace(/^https?:\/\//, "");
  return `https://${host}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
}

export function isAdminConfigured(): boolean {
  return Boolean(ADMIN_TOKEN);
}

export async function adminGraphQL<T = any>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(adminEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Admin GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

// Upload one image to Shopify Files and return its MediaImage GID.
export async function uploadImageToShopify(file: File): Promise<string | null> {
  if (!ADMIN_TOKEN || !file || file.size === 0) return null;

  // 1) Ask Shopify for a staged upload target.
  const staged = await adminGraphQL<{
    stagedUploadsCreate: {
      stagedTargets: {
        url: string;
        resourceUrl: string;
        parameters: { name: string; value: string }[];
      }[];
      userErrors: { message: string }[];
    };
  }>(
    `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { message }
      }
    }`,
    {
      input: [
        {
          filename: file.name || "photo.jpg",
          mimeType: file.type || "image/jpeg",
          resource: "IMAGE",
          httpMethod: "POST",
          fileSize: String(file.size),
        },
      ],
    },
  );
  const target = staged.stagedUploadsCreate.stagedTargets?.[0];
  if (!target) return null;

  // 2) Upload the bytes to the staged target.
  const uploadForm = new FormData();
  for (const p of target.parameters) uploadForm.append(p.name, p.value);
  uploadForm.append(
    "file",
    new Blob([await file.arrayBuffer()], { type: file.type }),
    file.name || "photo.jpg",
  );
  const up = await fetch(target.url, { method: "POST", body: uploadForm });
  if (!up.ok) throw new Error(`Staged upload failed: ${up.status}`);

  // 3) Register the uploaded file in Shopify Files.
  const created = await adminGraphQL<{
    fileCreate: {
      files: { id: string }[];
      userErrors: { message: string }[];
    };
  }>(
    `mutation($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id }
        userErrors { message }
      }
    }`,
    {
      files: [{ originalSource: target.resourceUrl, contentType: "IMAGE" }],
    },
  );
  return created.fileCreate.files?.[0]?.id || null;
}

export type RefundRecord = {
  summary: string;
  status: string;
  details: string;
};

// Create one Refund Request record in the Shopify admin, with optional photos.
export async function createRefundRequestRecord(
  record: RefundRecord,
  photoIds: string[] = [],
): Promise<void> {
  if (!ADMIN_TOKEN) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is not set");

  const fields = [
    { key: "summary", value: record.summary },
    { key: "status", value: record.status },
    { key: "details", value: record.details },
  ];
  if (photoIds.length) {
    fields.push({ key: "photos", value: JSON.stringify(photoIds) });
  }

  const data = await adminGraphQL<{
    metaobjectCreate: {
      metaobject: { id: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(
    `mutation($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message code }
      }
    }`,
    { metaobject: { type: REFUND_TYPE, fields } },
  );
  const errs = data.metaobjectCreate.userErrors;
  if (errs?.length) {
    throw new Error(`metaobjectCreate failed: ${JSON.stringify(errs)}`);
  }
}

// Record a Drop Alerts membership signup as a `drop_alert` metaobject. The
// handle is derived from the email so duplicate signups collide (HANDLE_TAKEN)
// rather than pile up — the caller treats that as "already subscribed".
export async function createDropAlertRecord(
  email: string,
  source = "membership",
): Promise<{ created: boolean; duplicate: boolean }> {
  if (!ADMIN_TOKEN) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is not set");

  const handle = `da-${email
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

  // Shopify auto-suffixes duplicate handles instead of erroring, so dedupe by
  // checking for an existing record first.
  const existing = await adminGraphQL<{
    metaobjectByHandle: { id: string } | null;
  }>(
    `query($h: MetaobjectHandleInput!) {
      metaobjectByHandle(handle: $h) { id }
    }`,
    { h: { type: "drop_alert", handle } },
  );
  if (existing.metaobjectByHandle) {
    return { created: false, duplicate: true };
  }

  const data = await adminGraphQL<{
    metaobjectCreate: {
      metaobject: { id: string } | null;
      userErrors: { field: string[]; message: string; code: string }[];
    };
  }>(
    `mutation($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message code }
      }
    }`,
    {
      metaobject: {
        type: "drop_alert",
        handle,
        fields: [
          { key: "email", value: email },
          { key: "source", value: source },
          { key: "signed_up_at", value: new Date().toISOString() },
        ],
      },
    },
  );

  const errs = data.metaobjectCreate.userErrors ?? [];
  if (errs.length) {
    const taken = errs.some(
      (e) => e.code === "HANDLE_TAKEN" || /taken|already/i.test(e.message),
    );
    if (taken) return { created: false, duplicate: true };
    throw new Error(`metaobjectCreate failed: ${JSON.stringify(errs)}`);
  }
  return { created: true, duplicate: false };
}

// Trending search terms, read from `trending_search` metaobjects (editable in
// the Shopify admin), sorted by their `position` field. Not cached so admin
// edits show up promptly; the list is tiny.
export async function getTrendingSearchTerms(): Promise<string[]> {
  if (!ADMIN_TOKEN) return [];

  const data = await adminGraphQL<{
    metaobjects: {
      nodes: { fields: { key: string; value: string }[] }[];
    };
  }>(
    `query {
      metaobjects(type: "trending_search", first: 50) {
        nodes { fields { key value } }
      }
    }`,
  );

  const val = (fields: { key: string; value: string }[], key: string) =>
    fields.find((f) => f.key === key)?.value ?? "";

  return data.metaobjects.nodes
    .map((n) => ({
      term: val(n.fields, "term"),
      position: parseInt(val(n.fields, "position")) || 999,
    }))
    .filter((t) => t.term)
    .sort((a, b) => a.position - b.position)
    .map((t) => t.term);
}

export type ProductReview = {
  id: string;
  rating: number;
  author: string;
  body: string;
  createdAt: string;
};

// All reviews for a product (read from `cc_review` metaobjects), newest first,
// with the aggregate average + count. Cached and tagged "reviews": submitting a
// review (review-actions.ts) calls updateTag("reviews"), so new reviews show
// immediately; cacheLife("hours") bounds staleness for direct-admin edits. This
// removes a blocking 250-metaobject Admin round-trip from every PDP render.
export async function getProductReviews(
  productHandle: string,
): Promise<{ reviews: ProductReview[]; count: number; average: number }> {
  "use cache";
  cacheTag("reviews", `reviews-${productHandle}`);
  cacheLife("hours");
  if (!ADMIN_TOKEN) return { reviews: [], count: 0, average: 0 };

  const data = await adminGraphQL<{
    metaobjects: {
      nodes: { id: string; fields: { key: string; value: string }[] }[];
    };
  }>(
    `query {
      metaobjects(type: "cc_review", first: 250) {
        nodes { id fields { key value } }
      }
    }`,
  );

  const val = (fields: { key: string; value: string }[], key: string) =>
    fields.find((f) => f.key === key)?.value ?? "";

  const reviews: ProductReview[] = data.metaobjects.nodes
    .filter((n) => val(n.fields, "product_handle") === productHandle)
    .map((n) => ({
      id: n.id,
      rating: Math.max(1, Math.min(5, parseInt(val(n.fields, "rating")) || 0)),
      author: val(n.fields, "author"),
      body: val(n.fields, "body"),
      createdAt: val(n.fields, "created_at"),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { reviews, count, average };
}

// Persist a single product review as a `cc_review` metaobject.
export async function createProductReview(input: {
  productHandle: string;
  rating: number;
  author: string;
  body: string;
}): Promise<void> {
  if (!ADMIN_TOKEN) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is not set");

  const rating = Math.max(1, Math.min(5, Math.round(input.rating)));
  const data = await adminGraphQL<{
    metaobjectCreate: {
      metaobject: { id: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(
    `mutation($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message code }
      }
    }`,
    {
      metaobject: {
        type: "cc_review",
        fields: [
          { key: "product_handle", value: input.productHandle },
          { key: "rating", value: String(rating) },
          { key: "author", value: input.author },
          { key: "body", value: input.body },
          { key: "created_at", value: new Date().toISOString() },
        ],
      },
    },
  );
  const errs = data.metaobjectCreate.userErrors;
  if (errs?.length) {
    throw new Error(`metaobjectCreate failed: ${JSON.stringify(errs)}`);
  }
}

// --- Customer phone -------------------------------------------------------
// Shopify's Customer Account API cannot set a phone number: CustomerUpdateInput
// only accepts firstName/lastName, and Customer.phoneNumber is read-only there.
// So the number has to be written onto the customer record with the Admin API,
// which needs write_customers — a scope the current custom app does not have.
//
// Rather than hide this behind an env flag someone has to remember to flip, ask
// Shopify what the token is actually allowed to do. The field appears on the
// account page by itself once the scope is granted and the token rotated, with
// no redeploy.
let customerScopeCache: { checkedAt: number; allowed: boolean } | null = null;
const SCOPE_CACHE_MS = 10 * 60 * 1000;

export async function adminCanWriteCustomers(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  if (
    customerScopeCache &&
    Date.now() - customerScopeCache.checkedAt < SCOPE_CACHE_MS
  ) {
    return customerScopeCache.allowed;
  }
  try {
    const host = STORE_DOMAIN.replace(/^https?:\/\//, "");
    const res = await fetch(`https://${host}/admin/oauth/access_scopes.json`, {
      headers: { "X-Shopify-Access-Token": ADMIN_TOKEN },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as {
      access_scopes?: { handle: string }[];
    };
    const allowed = (json.access_scopes ?? []).some(
      (s) => s.handle === "write_customers",
    );
    customerScopeCache = { checkedAt: Date.now(), allowed };
    return allowed;
  } catch {
    // Treat an unreachable/failed probe as "not available" so the UI stays
    // hidden rather than offering a save that would fail.
    customerScopeCache = { checkedAt: Date.now(), allowed: false };
    return false;
  }
}

// `customerId` must come from the signed-in session, never from form input —
// otherwise this would let anyone rewrite any customer's phone number.
export async function setCustomerPhone(
  customerId: string,
  phone: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const data = await adminGraphQL<{
      customerUpdate: {
        customer: { id: string } | null;
        userErrors: { field: string[] | null; message: string }[];
      };
    }>(
      `mutation SetCustomerPhone($id: ID!, $phone: String!) {
        customerUpdate(input: { id: $id, phone: $phone }) {
          customer { id defaultPhoneNumber { phoneNumber } }
          userErrors { field message }
        }
      }`,
      { id: customerId, phone },
    );
    const errs = data.customerUpdate?.userErrors ?? [];
    if (errs.length) return { ok: false, error: errs[0]!.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
