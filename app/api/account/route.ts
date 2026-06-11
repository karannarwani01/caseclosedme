import { isCustomerAuthConfigured } from "lib/shopify/customer/config";
import { readSession } from "lib/shopify/customer/session";
import { NextResponse } from "next/server";

// Lightweight session probe for client components (navbar, wishlist sync).
export async function GET() {
  const session = await readSession();
  return NextResponse.json({
    configured: isCustomerAuthConfigured(),
    loggedIn: Boolean(session),
    email: session?.email || null,
  });
}
