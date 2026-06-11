import { appOrigin, customerAuth } from "lib/shopify/customer/config";
import { readSession, SESSION_COOKIE } from "lib/shopify/customer/session";
import { NextResponse } from "next/server";

// Clear the local session and, when possible, hit Shopify's logout endpoint so
// the hosted SSO session ends too.
export async function GET() {
  const session = await readSession();

  let target = `${appOrigin()}/wishlist?logout=success`;
  if (customerAuth.logoutEndpoint && session?.idToken) {
    const url = new URL(customerAuth.logoutEndpoint);
    url.searchParams.set("id_token_hint", session.idToken);
    url.searchParams.set("post_logout_redirect_uri", appOrigin());
    target = url.toString();
  }

  const res = NextResponse.redirect(target);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
