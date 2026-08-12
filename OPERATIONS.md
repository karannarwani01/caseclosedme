# caseclosed — Operations Framework

Single reference for how the store runs: what's automated, what's manual,
and the playbook for each system. Last full verification: 2026-08-12.

## 1. System map

| Layer | What | Where |
|---|---|---|
| Storefront | Next.js 16 headless, plain CSS + Tailwind utilities | This repo → Vercel (`caseclosedme` team, project `caseclosedme`) |
| Backend | Shopify (products, cart, checkout, customers, metaobjects) | Store `rje5fv-8c`, primary domain `shop.caseclosedme.com` |
| Checkout | Shopify hosted checkout | COD (shipping-method + manual payment) and Ziina card. Shopify Payments currently PAUSED by Shopify — support-only fix |
| Email (transactional) | Shopify notification templates (Liquid, custom comic design) | Settings → Notifications: Order confirmation, Order canceled, Shipping confirmation |
| Email (marketing) | Shopify Email app (canvas editor) | 4 Active automations + NEW DROP / FRESH PICKS templates |
| Sender | donotreply@caseclosedme.com (Hostinger mailbox, forwards to caseclosed.me@gmail.com) | Verified + domain authenticated; no "via shopifyemail.com" |
| Forms | Refund request `/refund-request`, Contact `/contact` | Both write Shopify metaobjects + best-effort FormSubmit email relay |

## 2. Deploy pipeline (RULE: preview before prod)

1. `pnpm exec tsc --noEmit` must pass.
2. `git push origin master:preview-<name>` → Vercel builds a preview
   (env vars cover Preview since 2026-08-12).
3. Smoke test the preview URL (routes 200, changed behavior).
4. `git push origin master` = PROD deploy (~60s). Delete the preview branch.
5. On Windows use `pnpm dev` / `next build --webpack` (Turbopack breaks
   `images.loaderFile`).

Vercel API access: no-expiry scoped token at
`%USERPROFILE%\.vercel-tokens\caseclosedme-girish.txt` (CLI `vercel link`
fails with it — hit the REST API directly, or write `.vercel/project.json`
with projectId `prj_o6UnZBEbNIj7nfb7b7MwYats4Uc5`, orgId
`team_ki3gmpmgrcvo8QEpMfuHtr9z`).

## 3. Email templates

### Notification templates (Liquid — Settings → Notifications)
- All three are custom comic design AND dark-mode hardened:
  `color-scheme: light only` metas + `:root` CSS (kills iOS Mail inversion),
  `bgcolor` attributes + `cc-*` theme classes on every painted cell
  (keeps Gmail Android's transform uniform).
- **When editing: keep the `<meta name="color-scheme">` block and the
  `bgcolor`/`cc-*` attributes intact.** New painted sections need
  `bgcolor="#hex"` + the matching `cc-*` class.
- Edit flow: copy body out via clipboard, edit locally, paste back, Save,
  Preview, Send test (goes to logged-in staff email only).
- Shipping confirmation subject: `Order {{ name }} is on its way!`;
  headline art `email-hl-on-its-way.png` on the Shopify CDN. Art pipeline:
  Bangers font + yellow bar + pink offset shadow, rendered headless Chrome
  1000x240 @2x transparent (see scratchpad `hl-shipped.html` pattern).

### Shopify Email automations (canvas app — Settings → Apps → Messaging)
- 4 Active: Complete your order (30min wait), Welcome, How's the haul?
  (1d wait), Back for more? Legend.
- **Editing an Active email reverts it to Draft — ALWAYS click "Set to
  active" after saving.** Verify the parent automation is still ON under
  Messaging → Automations.
- Send test dialog accepts up to 5 addresses.
- NEW DROP shell + FRESH PICKS live under Templates: duplicate per
  campaign, swap `[ placeholders ]`, never send the shell itself.
- Scheduled senders (Windows Task Scheduler, this PC):
  `caseclosed-fresh-picks-weekly` (Mon 18:07), `caseclosed-drop-watch-daily`
  (19:37). Logs in `C:\Users\user\.claude\`.

## 4. Forms → admin queues

- Refund requests → metaobject `$app:refund_request`; Contact messages →
  metaobject `contact_message`. Both under Content → Metaobjects, newest
  first, `status: New` on arrival — update the field as you process them.
- Both also relay an email to caseclosed.me@gmail.com via FormSubmit
  (best effort; the metaobject is the source of truth).
- **The Gmail address must never appear on the site.** Everything points to
  `/contact`. The address lives only server-side (FormSubmit endpoint).

## 4b. Social icons in emails (added 2026-08-12)

Every template shows Instagram + Facebook + TikTok (white glyphs on the
black strip; CDN files `email-icon-{instagram,facebook,tiktok}-white.png`).
- Notification templates: icon row baked into the Liquid footer.
- Shopify Email automations: a Custom Liquid section right above the
  footer (the canvas has no native Social section on this plan). When
  building a NEW campaign/template, copy that Custom Liquid section or
  re-paste the snippet from any existing automation.
- URLs are the ones in `lib/constants.ts` — if a handle ever changes,
  update BOTH the site constants and the email blocks.

## 4c. Shipping with Jeebly (primary courier)

When fulfilling an order (Orders → Mark as fulfilled):
1. Enter the Jeebly tracking number.
2. Carrier: pick **Jeebly** if it appears in the dropdown; otherwise
   choose **Other** and paste the Jeebly tracking link as the tracking
   URL (from the Jeebly client portal).
3. Keep "Send shipment details to your customer" ON — that fires the
   "On its way!" email. Its TRACK YOUR PACKAGE button uses the tracking
   URL when present, else the order status page, so always attach the
   Jeebly URL when the dropdown lacks the carrier.

## 5. Order lifecycle (verified live 2026-08-12, order #1003)

1. Checkout (COD or Ziina) → Order confirmation email (comic template).
2. Fulfill with tracking number (notify customer ON) → "On its way!"
   tracking email with carrier + number + track button.
3. Cancel (restock ✓, notify ✓) → Cancellation email; COD orders show the
   yellow "NOTHING TO PAY" branch. Inventory restocks automatically.
4. Post-purchase automations fire on their own schedule (How's the haul?
   after 1 day, etc.).

## 5b. Email send timings (when each automation fires)

| Email | Trigger | Delay |
|---|---|---|
| Order confirmation | Order placed | Instant |
| On its way! (tracking) | Fulfillment created w/ notify | Instant |
| Order cancelled | Order cancelled w/ notify | Instant |
| Complete your order | Checkout abandoned | 30 minutes |
| You're in! (welcome) | Newsletter signup | Instant |
| How's the haul? (review ask) | 1st order placed | 1 day |
| Back for more? Legend. | 2nd order placed | 1 day |
| FRESH PICKS | Scheduled task (this PC) | Mondays 18:07 Dubai, auto-send |
| NEW DROP | Daily product-watch task | Checked 19:37 daily; sends only if new products in last 26h (3-day cooldown) |

## 6. Known state / blockers (as of 2026-08-12)

- **Shopify Payments: "sales paused", payouts also blocked.** Banner says
  contact support; the account passed KYC and has zero orders/disputes.
  Support chat is the only unblock path (Karan opted to defer). Ziina card
  + COD carry checkout meanwhile.
- Footer "دبي DU" on the Pumpy legal entity: cosmetic; deliberately NOT
  edited while the payments hold is active (business-detail edits can
  re-trigger KYC).
- Judge.me reviews, gbrain embeddings: parked (see memory/notes).

## 7. Verification snapshot (2026-08-12)

- tsc clean; all public routes 200; og/twitter/canonical/description on
  every route; og:image everywhere incl. utility routes; robots disallows
  /api/ + /account; /account noindexed; sitemap includes /contact.
- Refund + contact forms E2E-tested against prod (metaobjects verified).
- All 7 policy pages scrubbed of the Gmail address (live + repo copies).
- Full email suite test-sent to agnanigirish@gmail.com +
  karannarwani01@gmail.com from donotreply@caseclosedme.com.
