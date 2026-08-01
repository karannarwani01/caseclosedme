import { isAdminConfigured } from "lib/shopify-admin";
import { queueReviewRequest } from "lib/review-requests";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Shopify signs webhooks with the app's secret. Create the subscription with
// the same app whose token we use for writes, so this secret verifies them.
const WEBHOOK_SECRET =
  process.env.SHOPIFY_WEBHOOK_SECRET ||
  process.env.SHOPIFY_ADMIN_CLIENT_SECRET ||
  "";

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

// Shopify Flow's "Send HTTP request" action can't sign with the webhook HMAC,
// so Flow authenticates with a shared-secret header instead. Flow is the
// delivery path because a Dev Dashboard bug blocks granting read_orders to
// the custom app (no scope = no orders/fulfilled webhook subscription).
const FLOW_SECRET = process.env.SHOPIFY_REVALIDATION_SECRET || "";

function verifyFlowSecret(header: string | null): boolean {
  if (!FLOW_SECRET || !header) return false;
  try {
    const a = Buffer.from(FLOW_SECRET);
    const b = Buffer.from(header);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// orders/fulfilled webhook: enqueue a review-request record for the daily
// cron (app/api/cron/review-requests) to email once the delay has passed.
// Idempotent — the queue record's handle is derived from the order id, so
// Shopify's webhook re-deliveries settle to no-ops.
export async function POST(req: NextRequest) {
  const raw = await req.text();

  if (
    !verify(raw, req.headers.get("x-shopify-hmac-sha256")) &&
    !verifyFlowSecret(req.headers.get("x-cc-webhook-secret"))
  ) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  let payload: {
    id?: number;
    name?: string;
    email?: string;
    contact_email?: string;
    customer?: { first_name?: string };
    line_items?: { product_id?: number; title?: string; gift_card?: boolean }[];
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true, skipped: "bad_json" });
  }

  const email = (payload.email || payload.contact_email || "").trim();
  if (!payload.id || !email || !isAdminConfigured()) {
    return NextResponse.json({ ok: true, skipped: "no_email_or_config" });
  }

  // One entry per product; the review email links each product's PDP.
  const seen = new Set<number>();
  const items = (payload.line_items || [])
    .filter((li) => {
      if (!li.product_id || li.gift_card || seen.has(li.product_id))
        return false;
      seen.add(li.product_id);
      return true;
    })
    .slice(0, 6)
    .map((li) => ({
      productId: `gid://shopify/Product/${li.product_id}`,
      title: li.title || "",
    }));
  if (items.length === 0) {
    return NextResponse.json({ ok: true, skipped: "no_products" });
  }

  try {
    const { created } = await queueReviewRequest({
      orderId: String(payload.id),
      orderName: payload.name || "",
      email,
      firstName: payload.customer?.first_name || "",
      items,
    });
    return NextResponse.json({ ok: true, created });
  } catch {
    // 500 so Shopify retries the delivery.
    return new NextResponse("queue_failed", { status: 500 });
  }
}
