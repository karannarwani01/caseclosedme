import { buildReviewRequestEmail } from "lib/review-email";
import {
  listOptedOutEmails,
  listQueuedReviewRequests,
  setReviewRequestStatus,
} from "lib/review-requests";
import { adminGraphQL, isAdminConfigured } from "lib/shopify-admin";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// Days between fulfillment and the review ask — long enough for the parcel to
// actually be in hand and opened.
const DELAY_DAYS = Number(process.env.REVIEW_REQUEST_DELAY_DAYS || 5);
// Resend's free tier caps at 100 emails/day; leave headroom for other sends.
const MAX_PER_RUN = 40;

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM = process.env.REVIEW_FROM_EMAIL || "caseclosed <reviews@caseclosedme.com>";

// Daily cron (vercel.json): email queued review requests whose delay has
// passed. Env-gated on RESEND_API_KEY, so the queue just accumulates until
// the Resend account exists — nothing is lost in the meantime.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  if (!RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: "no_resend_key" });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: true, skipped: "no_admin_token" });
  }

  const cutoff = Date.now() - DELAY_DAYS * 24 * 60 * 60 * 1000;
  const due = (await listQueuedReviewRequests())
    .filter((r) => {
      const t = Date.parse(r.fulfilledAt);
      return Number.isFinite(t) && t <= cutoff;
    })
    .slice(0, MAX_PER_RUN);
  if (due.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const optouts = await listOptedOutEmails();

  // Resolve product handles in one batch; deleted/archived products drop out.
  const ids = [...new Set(due.flatMap((r) => r.items.map((i) => i.productId)))];
  const nodes = await adminGraphQL<{
    nodes: ({ id: string; handle: string; status: string } | null)[];
  }>(
    `query($ids: [ID!]!) {
      nodes(ids: $ids) { ... on Product { id handle status } }
    }`,
    { ids },
  );
  const handleById = new Map(
    nodes.nodes
      .filter((n): n is NonNullable<typeof n> => !!n && n.status === "ACTIVE")
      .map((n) => [n.id, n.handle]),
  );

  let sent = 0;
  let skipped = 0;
  for (const r of due) {
    if (optouts.has(r.email.toLowerCase())) {
      await setReviewRequestStatus(r.id, "skipped");
      skipped++;
      continue;
    }
    const items = r.items
      .filter((i) => handleById.has(i.productId))
      .map((i) => ({ title: i.title, handle: handleById.get(i.productId)! }));
    if (items.length === 0) {
      await setReviewRequestStatus(r.id, "skipped");
      skipped++;
      continue;
    }

    const { subject, html } = buildReviewRequestEmail({
      firstName: r.firstName,
      email: r.email,
      items,
    });
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [r.email], subject, html }),
    });
    if (res.ok) {
      await setReviewRequestStatus(r.id, "sent");
      sent++;
    }
    // Non-2xx: leave queued; the next run retries (e.g. daily rate cap hit).
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
