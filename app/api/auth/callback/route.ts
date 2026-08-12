import {
  appOrigin,
  customerAuth,
  redirectUri,
} from "lib/shopify/customer/config";
import { decodeJwtPayload } from "lib/shopify/customer/pkce";
import {
  encodeSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "lib/shopify/customer/session";
import {
  encodeTokens,
  TOKEN_COOKIE,
  tokensFromResponse,
} from "lib/shopify/customer/tokens";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function back(path: string) {
  return NextResponse.redirect(`${appOrigin()}${path}`);
}

// OAuth redirect target: verify state, exchange the code for tokens, derive the
// customer identity from the id_token, and open a session.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");

  const jar = await cookies();
  const verifier = jar.get("cc_pkce")?.value;
  const savedState = jar.get("cc_state")?.value;
  // Same-site-path check mirrors the login route (defense in depth — the
  // cookie is httpOnly but this guards any legacy/hand-set value).
  const rawReturn = jar.get("cc_return")?.value || "/account";
  const returnTo =
    rawReturn.startsWith("/") && !rawReturn.startsWith("//")
      ? rawReturn
      : "/account";

  if (!code) return back("/wishlist?login=error&reason=no_code");
  if (!verifier) return back("/wishlist?login=error&reason=no_verifier_cookie");
  if (!state || !savedState || state !== savedState) {
    return back("/wishlist?login=error&reason=state_mismatch");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", customerAuth.clientId);
  body.set("redirect_uri", redirectUri());
  body.set("code", code);
  body.set("code_verifier", verifier);

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    // Shopify returns 403 without a User-Agent.
    "User-Agent": "caseclosed-wishlist/1.0",
  };
  // Confidential/web client: authenticate with HTTP Basic. Public clients prove
  // themselves with PKCE alone (the code_verifier already in the body). We call
  // the token endpoint server-side, so we deliberately omit the Origin header —
  // the Origin / JavaScript-origin check is a browser-CORS concern and would
  // otherwise require whitelisting our host as a JavaScript origin.
  if (customerAuth.clientSecret) {
    headers.Authorization =
      "Basic " +
      Buffer.from(
        `${customerAuth.clientId}:${customerAuth.clientSecret}`,
      ).toString("base64");
  }

  let tok: {
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  try {
    const tokenRes = await fetch(customerAuth.tokenEndpoint, {
      method: "POST",
      headers,
      body,
    });
    if (!tokenRes.ok) {
      return back(`/wishlist?login=token_error&status=${tokenRes.status}`);
    }
    tok = await tokenRes.json();
  } catch {
    return back("/wishlist?login=token_error&reason=fetch_failed");
  }

  const claims = decodeJwtPayload(tok.id_token || "") || {};
  const customerKey = String(
    claims.sub || claims.customer_id || tok.access_token?.slice(0, 24) || "",
  );
  if (!customerKey) return back("/wishlist?login=identity_error");
  const email = String(claims.email || "");

  // returnTo may already carry a query string — appending "?login=success"
  // blindly would produce a malformed double-"?" URL.
  const res = back(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}login=success`,
  );
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ customerKey, email, idToken: tok.id_token }),
    sessionCookieOptions,
  );
  // Persist the Customer Account API tokens so /account can query the
  // customer's own orders + profile (refreshed on demand).
  if (tok.access_token) {
    res.cookies.set(
      TOKEN_COOKIE,
      encodeTokens(tokensFromResponse(tok)),
      sessionCookieOptions,
    );
  }
  res.cookies.delete("cc_pkce");
  res.cookies.delete("cc_state");
  res.cookies.delete("cc_return");
  return res;
}
