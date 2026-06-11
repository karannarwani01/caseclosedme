// Customer Account API (OAuth) configuration. Paste these values from your
// Shopify admin: Sales channels → Headless (or Hydrogen) → Customer Account API
// settings → Credentials + "Application endpoints". Server-only.

export const customerAuth = {
  clientId: process.env.SHOPIFY_CUSTOMER_CLIENT_ID || "",
  // Optional. Set it for a "confidential"/"web" client (sent as HTTP Basic on
  // the token request). Leave blank for a pure public client (PKCE only).
  clientSecret: process.env.SHOPIFY_CUSTOMER_CLIENT_SECRET || "",
  authorizeEndpoint: process.env.SHOPIFY_CUSTOMER_AUTHORIZE_ENDPOINT || "",
  tokenEndpoint: process.env.SHOPIFY_CUSTOMER_TOKEN_ENDPOINT || "",
  logoutEndpoint: process.env.SHOPIFY_CUSTOMER_LOGOUT_ENDPOINT || "",
  scope:
    process.env.SHOPIFY_CUSTOMER_SCOPE ||
    "openid email customer-account-api:full",
};

// The public origin of this app, used to build redirect/Origin headers. Must
// match a Callback URL registered in the Customer Account API settings.
export function appOrigin(): string {
  return (
    process.env.APP_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_ORIGIN ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function redirectUri(): string {
  return `${appOrigin()}/api/auth/callback`;
}

export function isCustomerAuthConfigured(): boolean {
  return Boolean(
    customerAuth.clientId &&
      customerAuth.authorizeEndpoint &&
      customerAuth.tokenEndpoint,
  );
}
