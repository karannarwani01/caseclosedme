import { adminGraphQL, isAdminConfigured } from "lib/shopify-admin";
import { colorTagFor } from "lib/shopify/color-tag";
import { sizeTagFor } from "lib/shopify/size-tag";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Shopify signs webhooks with the app's secret. Create the subscription with
// the same app whose token we use for writes, so this secret verifies them.
const WEBHOOK_SECRET =
  process.env.SHOPIFY_WEBHOOK_SECRET ||
  process.env.SHOPIFY_ADMIN_CLIENT_SECRET ||
  "";

// The storefront reads this sales channel; new products must be published here
// to appear on the site. Defaults to the "Caseclosed Headless" publication.
const HEADLESS_PUBLICATION_ID =
  process.env.SHOPIFY_HEADLESS_PUBLICATION_ID ||
  "gid://shopify/Publication/195930194119";

function verify(rawBody: string, hmacHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !hmacHeader) return false;
  const digest = createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    const a = Buffer.from(digest);
    const b = Buffer.from(hmacHeader);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// products/create + products/update webhook: publish new products to the
// headless storefront channel and auto-assign size-*/color-* tags. Idempotent —
// only writes what's missing, so the update it triggers settles to a no-op.
export async function POST(req: NextRequest) {
  const raw = await req.text();

  if (!verify(raw, req.headers.get("x-shopify-hmac-sha256"))) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  let payload: {
    id?: number;
    admin_graphql_api_id?: string;
    title?: string;
    product_type?: string;
    tags?: string;
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true, skipped: "bad_json" });
  }

  const tags = (payload.tags || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const has = (prefix: string) => tags.some((t) => t.startsWith(prefix));

  const gid =
    payload.admin_graphql_api_id ||
    (payload.id ? `gid://shopify/Product/${payload.id}` : null);
  if (!gid || !isAdminConfigured()) {
    return NextResponse.json({ ok: true, skipped: "not_configured" });
  }

  let published = false;

  // 1. Ensure the product is on the headless storefront channel — but only when
  //    it isn't already, so the resulting update webhook settles to a no-op.
  if (HEADLESS_PUBLICATION_ID) {
    try {
      const data = await adminGraphQL<{
        product: { publishedOnPublication: boolean } | null;
      }>(
        `query ($id: ID!, $pub: ID!) {
          product(id: $id) { publishedOnPublication(publicationId: $pub) }
        }`,
        { id: gid, pub: HEADLESS_PUBLICATION_ID },
      );
      if (data.product && !data.product.publishedOnPublication) {
        await adminGraphQL(
          `mutation ($id: ID!, $pub: ID!) {
            publishablePublish(id: $id, input: [{ publicationId: $pub }]) {
              userErrors { message }
            }
          }`,
          { id: gid, pub: HEADLESS_PUBLICATION_ID },
        );
        published = true;
      }
    } catch {
      // non-fatal: a later product update will retry publishing
    }
  }

  // 2. Add the missing size/color tags.
  const toAdd: string[] = [];
  if (!has("size-")) {
    const sizeTag = sizeTagFor(payload.title || "", payload.product_type || "");
    if (sizeTag) toAdd.push(sizeTag);
  }
  if (!has("color-")) toAdd.push(colorTagFor(payload.title || ""));

  if (toAdd.length) {
    try {
      await adminGraphQL(
        `mutation ($id: ID!, $tags: [String!]!) {
          tagsAdd(id: $id, tags: $tags) { userErrors { message } }
        }`,
        { id: gid, tags: toAdd },
      );
    } catch {
      return NextResponse.json({ ok: false, error: "write_failed" });
    }
  }

  if (!published && toAdd.length === 0) {
    return NextResponse.json({ ok: true, skipped: "already_done" });
  }
  return NextResponse.json({ ok: true, published, added: toAdd });
}
