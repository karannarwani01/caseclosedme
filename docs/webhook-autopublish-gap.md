# Heads-up: `products/create` webhook intermittently skipped auto-tag + auto-publish

**Date:** 2026-06-12

## What happened

The `app/api/webhooks/products` webhook (auto `size-*`/`color-*` tagging + auto-publish to
the headless channel) **silently missed 3 of the latest products**. They were created via the
Shopify Admin API and ended up:

- published to **Online Store only** — NOT to **Caseclosed Headless** (the channel the
  storefront's Storefront-API token reads from), and
- missing the `funko-pops` tag (so excluded from the `funko-pops` smart collection that
  `/search/funko-pops` renders), plus all facet tags and the `productType` normalisation.

Net effect: the headless storefront browse page showed **26** instead of **29** — the 3 were
invisible there, although live on the Online Store channel.

## Affected products

| Product                                             |    # |
| --------------------------------------------------- | ---: |
| 007 – Golden Girl (Goldfinger)                      |  519 |
| 007 – James Bond (GoldenEye)                        |  693 |
| One Piece – Silvers Rayleigh (Chalice Collectibles) | 2150 |

All earlier products in the same batch (Nomi #1012, Safin #1013, …) were handled correctly,
so this looks **intermittent**, not a hard failure.

## Manual fix already applied (nothing is blocked)

For each of the 3:

- `publishablePublish` → **Caseclosed Headless** (`gid://shopify/Publication/195930194119`)
- `tagsAdd`: `funko-pops` + `figures`, `funko`, `funko-pop-vinyl`, `size-standard`,
  `new-arrivals`, a `color-*` (Bond = black, Golden Girl = yellow/gold, Rayleigh = grey/silver),
  category (`funko-movies` / `funko-anime`), and `funko-exclusives` where applicable
- `productUpdate` → `productType: "Funko Pop"` (they were created as "Collectible Figure")

Storefront now correctly shows **29**.

## Suggested investigation

- **Delivery reliability:** check Shopify webhook delivery logs for failed/timed-out
  `products/create` attempts on these 3 product IDs.
- **Idempotency guard:** if the dedupe key is too aggressive, a retried delivery (or a
  near-simultaneous `products/create` + `products/update`) could be treated as already-processed
  and no-op'd.
- **Atomicity:** confirm publish + tag happen together; a mid-handler error after
  publish-to-online-store but before headless-publish/tagging produces exactly this state.
- **Backstop:** consider a periodic reconciliation job (or a manual `/api/admin/reconcile`) that
  finds ACTIVE `vendor:Funko` products missing `funko-pops` / not on the headless channel and
  fixes them.
