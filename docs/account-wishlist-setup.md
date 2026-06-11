# Account-synced Wishlist — Setup

The wishlist works out of the box as a **local (localStorage)** list — no login
needed. This doc turns on **account sync**: when a customer logs in, their
favourites are saved to Shopify and follow them across devices.

The code is already built and wired to env vars. It stays dormant (local-only,
account button → hosted account page) until the env vars below are set.

## How it works

- **Login:** Customer Account API, OAuth 2.0 + PKCE (`/api/auth/login` →
  `/api/auth/callback` → `/api/auth/logout`). Identity (a stable customer key +
  email) comes from the `id_token` and is kept in an httpOnly session cookie.
- **Storage:** the list is saved in Shopify as an **app-owned metaobject**
  (`$app:wishlist`, one record per customer), written with the existing Admin
  token — the same pattern as refund requests. No extra customer scopes needed.
- **Merge:** on login, the browser's local list is merged with the account list
  and the union is written back, so nothing is lost. Later changes write through
  (debounced) while logged in, and still mirror to localStorage.

## One-time Shopify setup

1. **Enable New Customer Accounts** (already on for this store):
   Settings → Customer accounts → "Customer accounts".
2. Install the **Headless** (or Hydrogen) sales channel, open your storefront,
   go to **Customer Account API settings**.
3. Set the client type to **Web/Confidential** (this app has a server).
4. **Callback URL(s):** add
   - `http://localhost:3000/api/auth/callback` (dev)
   - `https://caseclosedme.com/api/auth/callback` (prod)
5. **JavaScript origin(s):** add `http://localhost:3000` and your prod origin.
6. From **Credentials**, copy the **Client ID** (and **Client secret** for a
   confidential client). From **Application endpoints**, copy the
   **Authorization**, **Token**, and **Logout** endpoint URLs.

## Env vars

Add to `.env.local` (and to Vercel for prod). See `.env.example`:

```
APP_ORIGIN="http://localhost:3000"            # prod: https://caseclosedme.com
SHOPIFY_CUSTOMER_CLIENT_ID="..."
SHOPIFY_CUSTOMER_CLIENT_SECRET="..."          # blank for a public client
SHOPIFY_CUSTOMER_AUTHORIZE_ENDPOINT="..."
SHOPIFY_CUSTOMER_TOKEN_ENDPOINT="..."
SHOPIFY_CUSTOMER_LOGOUT_ENDPOINT="..."
```

Restart `pnpm dev`. The account icon now drives in-app login; `/api/account`
returns `configured: true`. Log in and your local favourites sync to the account.

## Notes / future hardening

- The session cookie is httpOnly + sameSite=lax. For production, consider
  signing/encrypting it and verifying the `id_token` signature (JWKS) — the
  current decode is unverified (it only reads claims from a token we just
  received over TLS from Shopify's token endpoint).
- No refresh-token rotation is implemented: identity persists in our cookie and
  storage uses the Admin token, so the customer access token isn't needed after
  login. Add refresh if you later call the Customer Account API directly.
- To store the list as native `list.product_reference` (linked products visible
  in admin) instead of JSON, swap the field type in
  `lib/shopify/customer/wishlist-remote.ts` and resolve product GIDs on read.
