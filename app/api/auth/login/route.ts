import { ACCOUNT_URL } from "lib/constants";
import {
  appOrigin,
  customerAuth,
  isCustomerAuthConfigured,
  redirectUri,
} from "lib/shopify/customer/config";
import {
  codeChallengeFromVerifier,
  generateCodeVerifier,
  randomString,
} from "lib/shopify/customer/pkce";
import { TEMP_COOKIE_OPTIONS } from "lib/shopify/customer/session";
import { NextRequest, NextResponse } from "next/server";

// Start the Customer Account API OAuth flow (PKCE). If the integration isn't
// configured yet, fall back to Shopify's hosted account page so the button
// never dead-ends.
export async function GET(req: NextRequest) {
  if (!isCustomerAuthConfigured()) {
    return NextResponse.redirect(ACCOUNT_URL);
  }

  const verifier = generateCodeVerifier();
  const challenge = codeChallengeFromVerifier(verifier);
  const state = randomString(16);
  const nonce = randomString(16);

  const authUrl = new URL(customerAuth.authorizeEndpoint);
  authUrl.searchParams.set("scope", customerAuth.scope);
  authUrl.searchParams.set("client_id", customerAuth.clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri());
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  // Only same-site paths. Anything else ("//host", "https://…", "@host" —
  // which would parse as userinfo@evil-host once appended to the origin) is
  // an open-redirect vector after a genuine login; fall back to /wishlist.
  const rawReturnTo = req.nextUrl.searchParams.get("return_to") || "/wishlist";
  const returnTo =
    rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
      ? rawReturnTo
      : "/wishlist";

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("cc_pkce", verifier, TEMP_COOKIE_OPTIONS);
  res.cookies.set("cc_state", state, TEMP_COOKIE_OPTIONS);
  res.cookies.set("cc_return", returnTo, TEMP_COOKIE_OPTIONS);
  // mark origin in logs only; nothing sensitive
  void appOrigin();
  return res;
}
