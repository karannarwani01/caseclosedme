# Case Closed — Design System

Case Closed (**caseclosed.me**) is an online pop‑culture collectibles store. Its catalog centers on **Funko Pops, trading cards, and figures**, sold through a high‑performance Shopify storefront built on Vercel's Next.js Commerce template.

The brand wears two faces:

1. **Digital / commerce.** Warm, friendly, modern. Soft cream backgrounds, a hot‑pink primary, a cyan secondary, and rounded everything (pills, 28px cards). Bricolage Grotesque for display, Inter for body. Playful but legible — the energy of a sticker‑on‑a‑mailer, not a corporate site.

2. **Physical / marketing mark.** A black‑and‑white pixel‑art logotype with a 3D cube glyph (the "case"). Lives on packaging, social, hero moments. Used as an accent against the soft web palette, not as the default UI tone.

This dual identity is intentional: the playful pastel layer is the storefront UX, and the pixel mark is the badge a collector recognizes on the box that shows up at their door.

---

## Sources used to build this system

- **Codebase** (mounted, read‑only) — `caseclosedme/` — a Vercel `next/commerce` Shopify storefront. Key files referenced:
  - `app/globals.css` — Tailwind v4 `@theme` block with the canonical brand tokens.
  - `app/layout.tsx` — Bricolage Grotesque + Inter font wiring.
  - `components/layout/navbar/index.tsx` — the floating pill nav.
  - `components/grid/tile.tsx`, `components/label.tsx` — product card + price chip.
  - `components/cart/modal.tsx`, `components/cart/add-to-cart.tsx` — cart UI (note: cart still uses the un‑rebranded `bg-blue-600`; flagged below).
  - `components/welcome-toast.tsx` — voice example.
- **Uploaded assets**
  - `uploads/WhatsApp Image 2026-05-24 at 5.51.22 PM.jpeg` — the pixel‑mark logo; preserved as `assets/case-closed-pixel-logo.jpeg`.
  - `uploads/logo.ai` was listed but **not present in the upload payload** — see _Caveats_.

---

## Index — what lives at the root

| File / folder         | What it is                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `README.md`           | This file. Brand context, content + visual foundations, iconography, index.                           |
| `SKILL.md`            | Agent‑skill entrypoint — load this in a Claude Code skill.                                            |
| `colors_and_type.css` | All CSS custom properties: raw palette, semantic tokens, type scale, radii, shadows, motion.          |
| `fonts/`              | Local font files (Inter‑Bold.ttf). Bricolage Grotesque is loaded from Google Fonts — **see Caveats**. |
| `assets/`             | Logos, brand marks, raw imagery.                                                                      |
| `preview/`            | Self‑contained HTML cards rendered in the Design System tab.                                          |
| `ui_kits/storefront/` | Pixel‑close recreation of the Case Closed storefront (homepage, PDP, cart, search).                   |
| `reference/`          | Copies of source files used while building this system. Not for distribution.                         |

There is no `slides/` folder — no deck templates were provided.

---

## Content fundamentals

The storefront's voice is **plain, warm, collector‑to‑collector**. The site is small and the copy reflects that — it isn't trying to sound like a department store.

**Tone is "your friend who has the pieces you've been hunting for."**

- **Person.** Second person ("Your cart is empty.", "Add to cart"). The store does not refer to itself as "we" in product UI. Friendly imperative is the default voice ("Proceed to Checkout", "Search products…", "Select product image").
- **Casing.** **Sentence case** for buttons, headings, and most UI strings ("Add to cart", "Latest arrivals", "Your cart is empty."). The exception is the legacy **uppercase site name** in the footer (`SITE_NAME` rendered with `.uppercase`) — a knowing nod to a packing‑slip stencil. Don't extend that uppercase treatment to UI generally.
- **Brand name.** Written **`caseclosed.me`** — lower‑case, with the `.me` styled in `--brand-pink`. Never "Case Closed Inc.", never "CaseClosed". The pixel mark is the only place "CASE CLOSED" appears in all caps, and only as art.
- **Punctuation.** Full stops on full sentences ("Your cart is empty."). Buttons and chips: no terminal punctuation. Em dashes are fine. Smart quotes preferred in marketing copy.
- **Numbers.** Tabular figures for prices (`font-feature-settings: "tnum"`). Currency rendered with `Intl.NumberFormat` and a narrow symbol; the ISO code follows the amount only at larger sizes (e.g. `$24.00 USD` on the homepage label, `$24.00` in the cart line). Quantities are always whole integers.
- **Emoji.** Used **sparingly, as garnish on marketing surfaces only** — the welcome toast leads with 🛍️, the source uses ▲ as a Vercel mark. Emoji are **never** used inside product cards, navigation, filters, or checkout. As a rule: at most one emoji per surface, and only where it adds warmth (a toast, a thank‑you email, a sale banner).
- **Categories** read like collector slang, not SEO bait: "Funko Pops", "Trading Cards", "Figures". Sort labels are conversational ("Trending", "Latest arrivals", "Price: Low to high"). Avoid corporate terms like "merchandise", "inventory", "SKU".
- **Empty / status copy** is short and human:
  - "Your cart is empty."
  - "There are no products that match \"<query>\""
  - "Out of stock", "Add to cart", "Proceed to Checkout"
- **Marketing copy** can lean a little playful — the welcome toast describes the storefront in one sentence and then offers a clear next action. Keep it under two sentences.

**Examples that ARE on‑brand**

> 🛍️ Welcome to Next.js Commerce!
> This is a high‑performance, SSR storefront powered by Shopify, Next.js, and Vercel. [Deploy your own](#).

> Showing 24 results for **"holographic charizard"**

> Your cart is empty.

**Examples that ARE NOT on‑brand**

> 🚀✨ DISCOVER OUR EXCLUSIVE COLLECTION OF PREMIUM COLLECTIBLES!!! ✨🚀
> Dear Valued Customer, please be advised that your basket currently contains zero (0) items.

---

## Visual foundations

### Palette

A cream base, deep‑navy ink, and two pop accents.

- `--brand-bg` **#fff8f0** — the page colour. Warm cream, not white. Everything sits on this.
- `--brand-ink` **#1a1a2e** — text + the dark logo square + every shadow's tint. Use instead of pure black.
- `--brand-pink` **#ff3d7f** — the one true accent. CTAs, focus rings, the `.me`, the active product ring, price chips, hover shadow tint.
- `--brand-pink-hover` **#ff2670** — pressed/hover state for the pink.
- `--brand-cyan` **#5bc0eb** — secondary accent. Used for animated "blob" backgrounds and quiet info states.
- `--brand-cream-2` **#ffeed9** — tinted surface, one step deeper than the page bg. Search field, soft chips.
- `--brand-yellow` **#ffd93d** — tertiary, sale stickers, marketing splashes.

Neutrals are derived as **alphas of `--brand-ink`** (`--ink-70`, `--ink-50`, `--ink-30`, `--ink-10`, `--ink-05`). This keeps every "grey" warm against cream. **Do not introduce a separate grey scale.**

### Type

Two faces, both variable, both with explicit roles.

- **Bricolage Grotesque** — display. Headings (`h1–h4`), product titles, hero copy, the site logo wordmark. Loaded as `--font-display` (variable, weights 400–800). Tracking is tightened by `-0.02em` on `h1/h2` for poster‑ish energy.
- **Inter** — body. All paragraphs, nav links, prices, form text, buttons. `--font-sans`.
- The **pixel logotype** (the upload) is its own thing: it's a raster mark, not a font. If you need to fake pixel text in HTML, use VT323 from Google Fonts as a stand‑in — but only on hero/marketing surfaces.

Scale lives in `colors_and_type.css` as `--fs-12` through `--fs-72`. Display headlines use `clamp()` so they scale fluidly.

### Spacing, layout, rhythm

- 4px base; tokens `--s-1` (4) through `--s-20` (80).
- The site is **center‑aligned on a soft canvas**. Max widths are wide (`max-w-6xl` / `--breakpoint-2xl`), but content always sits on the cream — there are no full‑width dark sections.
- Layout containers use generous `gap-4`/`gap-8`; the homepage hero is a **CSS Grid mosaic** (6 cols × 2 rows on md+, one "full" tile spans 4×2 and two "half" tiles span 2×1).
- Navbar is **fixed/sticky** at `top-3 md:top-5`, **floating** (not edge‑to‑edge): a pill with `bg-white/75` and `backdrop-blur-xl` over the cream. Footer is plain — no dark band.

### Radii — pills first, then 28px

- Buttons, chips, badges, nav, search field, price tag: **`--r-pill`** (`9999px`).
- Product cards, dialog panels: **`--r-2xl`** (28px).
- Form fields: pill.
- The dark logo square: `rounded-2xl` (16px) at 36×36, `rounded-xl` (12px) at 28×28.
- **Do not use small radii (≤8px)** except on the inline `code` token.

### Shadows

Two real shadows; everything else is a hairline border.

- `--shadow-card-rest` — `0 4px 20px -8px rgba(26,26,46,0.12)`. Used at rest on every card.
- `--shadow-card-hover` — `0 20px 40px -12px rgba(255,61,127,0.25)`. Pink‑tinted lift on hover. **This is the brand's signature shadow.**
- `--shadow-nav` — `0 8px 30px -12px rgba(26,26,46,0.15)`. The floating navbar.

Inner shadows are not used. Borders are hairline `1px solid var(--ink-10)` or `var(--ink-05)`.

### Hover, press, focus

- **Hover on a product card**: `-translate-y-1` lift + `rotate(-0.5deg)` micro‑tilt + swap rest shadow → hover shadow + `ring-2 ring-brand-pink`. Image inside scales to 1.05 over 500ms. This compound motion is the brand's most distinctive interaction.
- **Hover on a nav link**: `color: var(--accent)` only. No underline, no scale.
- **Hover on a primary button**: opacity 0.9 → 1.0 _or_ bg → `--brand-pink-hover`. No translate. No shadow on the button itself.
- **Press** is implicit (the opacity/colour shift carries it). No `:active` scale‑down.
- **Focus** is universal: `outline: 2px solid var(--brand-pink); outline-offset: 2px;`. Pink ring on cream is the brand. Don't replace it with the OS default.

### Motion

Three named animations in `globals.css`:

- `--animate-carousel` — 60s linear infinite translate, used to belt featured products across the homepage. Decorative, not informative.
- `--animate-marquee` — 25s linear infinite, half‑width translate. Same idea, faster cadence.
- `--animate-blob` — 18s ease‑in‑out infinite, a cyan blob that drifts and scales. Pure ambient garnish.

Transitions use **`--ease-out`** (`cubic-bezier(0.16, 1, 0.3, 1)`) for everything UI‑initiated, **`--dur-base` 300ms** for card lifts, **`--dur-fast` 150ms** for colour/opacity swaps. No bounces, no springs.

### Backdrops, transparency, blur

- The floating navbar is `bg-white/75` + `backdrop-blur-xl`.
- Product card labels are `bg-white/90` + `backdrop-blur-md`, sitting on top of the product image.
- The cart modal uses `bg-white/80` + `backdrop-blur-xl`; the underlying scrim is `bg-black/30` plus a tiny `backdrop-blur-[0.5px]` haze on enter.
- Transparency + blur is **always over imagery or the cream page**, never over arbitrary brand colour. Don't blur over pink.

### Imagery

The catalog is **product‑on‑white shots** (Funko Pops, slabbed trading cards, action figures). The tile component renders them with `object-contain p-4` on a `bg-white` card — i.e. the product floats inside the card with breathing room; we don't bleed product photos to the edge.

There is **no full‑bleed photography, no gradients used as hero backgrounds, no hand‑drawn illustration, no pattern fills**. The only "ambient" art is the cyan blob animation. Imagery vibe is warm + clean + collector‑catalogue, never moody or grainy.

If you need a placeholder, use a cream‑bg + `--brand-ink` outlined icon box with the pixel mark centered. Do not generate a hero photograph.

### Cards

The canonical card is the product tile:

- `rounded-3xl` (28px), `bg-white`, `shadow-card-rest`.
- On hover: lift + tilt + pink shadow + pink 2px ring + inner image scale 1.05.
- Optional floating "label" pill at the bottom: white/90 + blur + ink text, with a **pink pill price chip** on the right.

Reuse this anatomy for any browse/collection surface.

### What we don't do

- No bluish‑purple gradients.
- No emoji as iconography (see Iconography below).
- No left‑border‑accent cards.
- No drop‑shadow text.
- No dark mode as a primary surface. (The source has Tailwind `dark:` variants left over from the template — treat those as legacy.)
- No serif type.

---

## Iconography

The codebase uses two icon systems and one brand mark:

1. **Heroicons (outline, 24px)** — via `@heroicons/react/24/outline`. The shipped usages are:

   - `MagnifyingGlassIcon` — navbar search.
   - `ShoppingCartIcon` — cart open / empty state.
   - `XMarkIcon` — cart close button.
   - `PlusIcon` — "Add to Cart" leading icon.
   - `ArrowLeftIcon`, `ArrowRightIcon` — product gallery nav.

   These are SVGs at **`h-4 w-4`** (search), **`h-5`** (gallery arrows, plus icon), or **`h-6`** (cart close), stroked, colour inherited via `currentColor`. **In this design system we link Heroicons from a CDN** (`@heroicons/react` via esm.sh or the static SVG sprites from heroicons.com) — same set, same stroke weight, so visual fidelity is preserved.

2. **The Vercel triangle (`▲`)** — used as a typographic mark in the footer ("Created by ▲ Vercel"). Inherited from the template; only relevant if you keep the source attribution.

3. **The Case Closed brand mark** — two variants:
   - **Logo square** (digital): a `--brand-ink` square at 36×36 (rounded‑2xl) or 28×28 (rounded‑xl), with the wordmark "cc" centered in `--font-display`, bold, in `--brand-bg` cream. This is the only mark used inside the product UI.
   - **Pixel mark** (marketing/physical): the supplied 8‑bit logotype + 3D cube glyph. Black background, white pixels. Use on hero moments, packaging, the OG image, social posts. Never inside a button or nav.

**Emoji** appears only in marketing copy (the welcome toast 🛍️). Not in icons.

**Unicode glyphs** appear only as the Vercel ▲. Not used as native iconography.

**No icon font is shipped.** Everything is SVG.

Icons live in `assets/icons/` as inline SVG copies for offline use (Heroicons MIT). Prefer the CDN at runtime; copy locally if you ship.

---

## Caveats — read these

1. **`logo.ai` was not in the uploaded files.** Only the JPEG of the pixel mark made it through. The pixel mark is preserved at `assets/case-closed-pixel-logo.jpeg`. If you can re‑upload the AI file (or an SVG/PNG export), I'll vector it and add proper sizes.
2. **Bricolage Grotesque is loaded from Google Fonts**, not as a local TTF — the codebase relies on `next/font/google`, so there is no font file to copy. If you want a fully offline‑capable bundle, drop the WOFF2 files into `fonts/` and I'll switch `colors_and_type.css` to `@font-face`. **This is a substitution flag.**
3. **The cart modal still uses Tailwind's stock `bg-blue-600`** for the "Add to Cart" and "Proceed to Checkout" buttons (see `components/cart/add-to-cart.tsx` and `components/cart/modal.tsx`). Every other surface has been migrated to `--brand-pink`. This is almost certainly a leftover from the template — the UI kit here uses pink everywhere for consistency, but the source still ships blue.
4. **The codebase has Tailwind `dark:` classes throughout** (e.g. the footer and cart modal). The brand has no documented dark mode and the `@theme` block never defines one. I've treated dark mode as out of scope; do not use the leftover `dark:` styles as canonical.
5. **No deck template was provided** — the prompt's "if any slide decks attached" branch was skipped intentionally.
6. **No mobile app or docs site exists in the codebase** — there is exactly one product (the marketing+commerce storefront). Only one UI kit is built.
