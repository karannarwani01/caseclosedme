// Minimal HMAC-signed httpOnly customer session. We persist only identity (the
// stable customer key + email) plus the id_token (needed as a logout hint).
// The wishlist itself lives in Shopify (an $app:wishlist metaobject), so we
// don't need to keep the short-lived customer access token fresh here.
// The signature matters because /api/wishlist and /api/account trust the
// cookie's customerKey — without it anyone could set a forged cookie and
// read/overwrite another customer's wishlist.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cc_customer";

export type CustomerSession = {
  customerKey: string;
  email: string;
  idToken?: string;
};

// Cookies must be Secure when the public origin is HTTPS (prod, or the local
// HTTPS dev tunnel) so they survive the cross-site OAuth return navigation.
const ORIGIN =
  process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_APP_ORIGIN || "";
const SECURE = ORIGIN.startsWith("https");

export const sessionCookieOptions = {
  httpOnly: true,
  secure: SECURE,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

// Short-lived cookies used only during the OAuth round trip.
export const TEMP_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: SECURE,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600, // 10 minutes
};

// Signing key. The customer-auth client secret is already present (server-only)
// in every environment where login works; the admin secret is the fallback.
// Rotating it logs everyone out (they just sign in again) — no data is lost.
const SIGNING_KEY =
  process.env.SESSION_SECRET ||
  process.env.SHOPIFY_CUSTOMER_CLIENT_SECRET ||
  process.env.SHOPIFY_ADMIN_CLIENT_SECRET ||
  "";

function sign(payload: string): string {
  return createHmac("sha256", SIGNING_KEY).update(payload).digest("base64url");
}

export function encodeSession(s: CustomerSession): string {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(raw?: string): CustomerSession | null {
  if (!raw) return null;
  try {
    const [payload, sig] = raw.split(".");
    if (!payload || !sig) return null; // includes legacy unsigned cookies
    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(sig);
    if (expected.length !== given.length || !timingSafeEqual(expected, given))
      return null;
    const s = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (s && typeof s.customerKey === "string") return s as CustomerSession;
    return null;
  } catch {
    return null;
  }
}

// Read the current session inside a Route Handler / Server Component.
export async function readSession(): Promise<CustomerSession | null> {
  const c = await cookies();
  return decodeSession(c.get(SESSION_COOKIE)?.value);
}
