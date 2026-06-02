// Shopify Admin API client for writing refund requests into the store admin
// as app-owned metaobjects (type "$app:refund_request"), including photo
// uploads to Shopify Files. Server-only; never import into a client component.

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

async function adminGraphQL<T = any>(
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
