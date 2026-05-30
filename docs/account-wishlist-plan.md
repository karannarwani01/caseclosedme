# Account-synced Wishlist — Build Plan

**Status: planned (build at launch).** This is the "Option 2" wishlist: favourites
saved to the customer's Shopify account, synced across devices. Build it once the
prerequisites below are met — not during demo mode.

## Prerequisites (must be true before building)
1. **Real products in Shopify** and `USE_DEMO_PRODUCTS = false` (lib/demo-products.ts).
2. **Site deployed** to the production domain (OAuth needs a real callback URL).
3. **New Customer Accounts enabled** in Shopify: Settings → Customer accounts → New customer accounts.

## Shopify setup (Customer Account API)
1. Enable New Customer Accounts.
2. Configure a **Customer Account API** client (Hydrogen / Headless channel, or app config). Collect:
   - Client ID
   - Authorization endpoint, Token endpoint, Logout endpoint
   - Shop ID
3. Set **callback / redirect URIs**: `https://caseclosedme.com/api/auth/callback` (+ `http://localhost:3000/api/auth/callback` for dev).
4. Put the values in env: `CUSTOMER_ACCOUNT_API_CLIENT_ID`, `SHOPIFY_CUSTOMER_ACCOUNT_*` endpoints, etc.

## App build
1. **OAuth login flow** (OAuth 2.0 + PKCE):
   - `GET /api/auth/login` → redirect to Shopify authorize (with PKCE + state).
   - `GET /api/auth/callback` → exchange code for a customer access token; store in a secure httpOnly cookie/session; handle token refresh.
   - `GET /api/auth/logout` → clear session + hit Shopify logout endpoint.
2. **Replace the header hosted-login link** with this OAuth login. Account icon shows logged-in state (e.g., links to `/account`, shows "Log out").
3. **Wishlist storage** on the customer:
   - Customer metafield — namespace `custom`, key `wishlist`, type `list.product_reference`.
   - Read/write via the Customer Account API (or Admin API with the customer id).
   - Helpers: `getWishlist()`, `addToWishlist(productId)`, `removeFromWishlist(productId)`.
4. **Heart toggle** on product pages + product cards — toggles wishlist membership; if logged out, prompt to log in first.
5. **`/wishlist` page** — loads the saved products (Storefront API by id) with remove buttons; empty + logged-out states.

## Notes
- Until this is built, the header **heart icon links to `/wishlist` (404)** — either build this, or repoint/hide the heart in `components/layout/navbar/index.tsx`.
- Customer access tokens are short-lived → implement refresh.
- This is what makes login a *real* integration (vs. the current link to Shopify's hosted account). Doing it also upgrades the "login" feature to a full in-app session.
