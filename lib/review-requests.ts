// Post-fulfillment review requests: a queue of "ask this customer to review
// what they bought" records plus an email opt-out list, both stored as
// Shopify metaobjects (cc_review_request / cc_email_optout). The
// orders/fulfilled webhook enqueues; the daily cron sends via Resend once the
// delay has passed. Server-only; never import into a client component.

import { createHmac, timingSafeEqual } from "crypto";
import { adminGraphQL } from "lib/shopify-admin";

export type ReviewRequestItem = { productId: string; title: string };

export type QueuedReviewRequest = {
  id: string;
  orderId: string;
  orderName: string;
  email: string;
  firstName: string;
  items: ReviewRequestItem[];
  fulfilledAt: string;
  status: string;
};

const val = (fields: { key: string; value: string }[], key: string) =>
  fields.find((f) => f.key === key)?.value ?? "";

// One request per order: the metaobject handle is derived from the order id,
// and Shopify's metaobjectByHandle check makes re-delivered webhooks no-ops.
export async function queueReviewRequest(input: {
  orderId: string;
  orderName: string;
  email: string;
  firstName: string;
  items: ReviewRequestItem[];
}): Promise<{ created: boolean }> {
  const handle = `order-${input.orderId.replace(/[^a-z0-9]+/gi, "-")}`;

  const existing = await adminGraphQL<{
    metaobjectByHandle: { id: string } | null;
  }>(
    `query($h: MetaobjectHandleInput!) {
      metaobjectByHandle(handle: $h) { id }
    }`,
    { h: { type: "cc_review_request", handle } },
  );
  if (existing.metaobjectByHandle) return { created: false };

  const data = await adminGraphQL<{
    metaobjectCreate: {
      metaobject: { id: string } | null;
      userErrors: { message: string }[];
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
        type: "cc_review_request",
        handle,
        fields: [
          { key: "order_id", value: input.orderId },
          { key: "order_name", value: input.orderName },
          { key: "email", value: input.email.toLowerCase() },
          { key: "first_name", value: input.firstName },
          { key: "items", value: JSON.stringify(input.items) },
          { key: "fulfilled_at", value: new Date().toISOString() },
          { key: "status", value: "queued" },
        ],
      },
    },
  );
  const errs = data.metaobjectCreate.userErrors;
  if (errs?.length) {
    throw new Error(`queueReviewRequest failed: ${JSON.stringify(errs)}`);
  }
  return { created: true };
}

export async function listQueuedReviewRequests(): Promise<
  QueuedReviewRequest[]
> {
  const data = await adminGraphQL<{
    metaobjects: {
      nodes: { id: string; fields: { key: string; value: string }[] }[];
    };
  }>(
    `query {
      metaobjects(type: "cc_review_request", first: 250) {
        nodes { id fields { key value } }
      }
    }`,
  );

  return data.metaobjects.nodes
    .map((n) => {
      let items: ReviewRequestItem[] = [];
      try {
        items = JSON.parse(val(n.fields, "items") || "[]");
      } catch {
        // Malformed items JSON: the record still gets skipped downstream.
      }
      return {
        id: n.id,
        orderId: val(n.fields, "order_id"),
        orderName: val(n.fields, "order_name"),
        email: val(n.fields, "email"),
        firstName: val(n.fields, "first_name"),
        items,
        fulfilledAt: val(n.fields, "fulfilled_at"),
        status: val(n.fields, "status"),
      };
    })
    .filter((r) => r.status === "queued");
}

export async function setReviewRequestStatus(
  id: string,
  status: "sent" | "skipped",
): Promise<void> {
  await adminGraphQL(
    `mutation($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        userErrors { message }
      }
    }`,
    { id, metaobject: { fields: [{ key: "status", value: status }] } },
  );
}

// --- Opt-outs ---------------------------------------------------------------

export async function listOptedOutEmails(): Promise<Set<string>> {
  const data = await adminGraphQL<{
    metaobjects: {
      nodes: { fields: { key: string; value: string }[] }[];
    };
  }>(
    `query {
      metaobjects(type: "cc_email_optout", first: 250) {
        nodes { fields { key value } }
      }
    }`,
  );
  return new Set(
    data.metaobjects.nodes
      .map((n) => val(n.fields, "email").toLowerCase())
      .filter(Boolean),
  );
}

export async function addOptOut(email: string): Promise<void> {
  const normalized = email.toLowerCase();
  const handle = `oo-${normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

  const existing = await adminGraphQL<{
    metaobjectByHandle: { id: string } | null;
  }>(
    `query($h: MetaobjectHandleInput!) {
      metaobjectByHandle(handle: $h) { id }
    }`,
    { h: { type: "cc_email_optout", handle } },
  );
  if (existing.metaobjectByHandle) return;

  await adminGraphQL(
    `mutation($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { message }
      }
    }`,
    {
      metaobject: {
        type: "cc_email_optout",
        handle,
        fields: [
          { key: "email", value: normalized },
          { key: "created_at", value: new Date().toISOString() },
        ],
      },
    },
  );
}

// --- Unsubscribe links --------------------------------------------------------

// Unsubscribe links carry an HMAC of the email so nobody can opt other people
// out by guessing addresses.
const LINK_SECRET =
  process.env.EMAIL_LINK_SECRET ||
  process.env.SHOPIFY_ADMIN_CLIENT_SECRET ||
  "";

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", LINK_SECRET)
    .update(email.toLowerCase(), "utf8")
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!LINK_SECRET || !token) return false;
  try {
    const a = Buffer.from(unsubscribeToken(email));
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
