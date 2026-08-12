import { readSession } from "lib/shopify/customer/session";
import {
  getRemoteWishlist,
  setRemoteWishlist,
} from "lib/shopify/customer/wishlist-remote";
import { NextRequest, NextResponse } from "next/server";

// GET → the customer's account-synced wishlist (empty array if logged out).
export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ items: [], loggedIn: false });
  try {
    const items = await getRemoteWishlist(session.customerKey);
    return NextResponse.json({ items, loggedIn: true });
  } catch (e) {
    console.error("wishlist GET failed:", e);
    return NextResponse.json(
      { items: [], loggedIn: true, error: "server_error" },
      { status: 500 },
    );
  }
}

// PUT { items } → replace the customer's account-synced wishlist.
export async function PUT(req: NextRequest) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, reason: "not_logged_in" },
      { status: 401 },
    );
  }
  let items: unknown = [];
  try {
    items = (await req.json())?.items;
  } catch {
    /* ignore bad body */
  }
  if (!Array.isArray(items)) items = [];
  try {
    await setRemoteWishlist(session.customerKey, session.email, items as any);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("wishlist PUT failed:", e);
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 },
    );
  }
}
