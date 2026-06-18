// Customer Account API access/refresh tokens, kept in an httpOnly cookie so the
// account dashboard can query the customer's own orders/profile. Separate from
// the identity session (cc_customer) to keep each cookie small.
import { cookies } from "next/headers";
import { customerAuth } from "./config";
import { sessionCookieOptions } from "./session";

export const TOKEN_COOKIE = "cc_ctok";

export type CustomerTokens = {
  access: string;
  refresh?: string;
  expiresAt: number; // epoch ms
};

export function encodeTokens(t: CustomerTokens): string {
  return Buffer.from(JSON.stringify(t)).toString("base64");
}

export function decodeTokens(raw?: string): CustomerTokens | null {
  if (!raw) return null;
  try {
    const t = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    if (t && typeof t.access === "string") return t as CustomerTokens;
    return null;
  } catch {
    return null;
  }
}

// Build the token cookie value from a token-endpoint response.
export function tokensFromResponse(tok: {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}): CustomerTokens {
  return {
    access: tok.access_token || "",
    refresh: tok.refresh_token,
    expiresAt: Date.now() + (tok.expires_in ?? 7200) * 1000,
  };
}

// Return a valid access token, refreshing via the refresh_token if it's expired
// (or about to). Persists the refreshed token. Returns null if unavailable —
// callers should degrade gracefully (the dashboard still shows identity).
export async function getFreshAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const t = decodeTokens(jar.get(TOKEN_COOKIE)?.value);
  if (!t) return null;
  if (Date.now() < t.expiresAt - 60_000) return t.access;
  if (!t.refresh) return null;

  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("client_id", customerAuth.clientId);
  body.set("refresh_token", t.refresh);
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "caseclosed-account/1.0",
  };
  if (customerAuth.clientSecret) {
    headers.Authorization =
      "Basic " +
      Buffer.from(
        `${customerAuth.clientId}:${customerAuth.clientSecret}`,
      ).toString("base64");
  }
  try {
    const res = await fetch(customerAuth.tokenEndpoint, {
      method: "POST",
      headers,
      body,
    });
    if (!res.ok) return null;
    const j = await res.json();
    const next = tokensFromResponse(j);
    if (!next.refresh) next.refresh = t.refresh;
    jar.set(TOKEN_COOKIE, encodeTokens(next), sessionCookieOptions);
    return next.access;
  } catch {
    return null;
  }
}
