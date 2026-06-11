// PKCE (RFC 7636) + random token helpers for the OAuth flow. Node runtime.
import { createHash, randomBytes } from "crypto";

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function randomString(bytes = 32): string {
  return base64url(randomBytes(bytes));
}

export function generateCodeVerifier(): string {
  return randomString(32);
}

export function codeChallengeFromVerifier(verifier: string): string {
  return base64url(createHash("sha256").update(verifier).digest());
}

// Decode a JWT payload WITHOUT verifying the signature. Fine for reading the
// id_token claims (sub/email) right after a trusted token exchange; do NOT use
// this to trust tokens received from untrusted sources.
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(
      part.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
