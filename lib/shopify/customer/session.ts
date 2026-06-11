// Minimal signed-by-httpOnly customer session. We persist only identity (the
// stable customer key + email) plus the id_token (needed as a logout hint).
// The wishlist itself lives in Shopify (an $app:wishlist metaobject), so we
// don't need to keep the short-lived customer access token fresh here.
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

export function encodeSession(s: CustomerSession): string {
  return Buffer.from(JSON.stringify(s)).toString("base64");
}

export function decodeSession(raw?: string): CustomerSession | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
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
