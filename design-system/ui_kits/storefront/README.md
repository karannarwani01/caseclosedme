# Storefront UI kit

Pixel-close recreation of **caseclosed.me** (the shipped Next.js Commerce storefront). Open `index.html` to see an interactive click-through covering:

- Home (hero mosaic + featured carousel + footer)
- Search / collection results
- Product detail page (gallery + variant selector + add to cart)
- Cart drawer (slide-in, with line items, qty +/-, totals, checkout button)

Everything is **fake data, no API**. The kit is for visual reference and rapid mockups — not production. Components are intentionally simple cosmetic recreations of the source.

## Files

| File              | What it is                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `index.html`      | The interactive prototype. Loads React 18, Babel standalone, and `colors_and_type.css` from the root.                         |
| `data.jsx`        | Fake product catalog (titles, prices, variants, "images" rendered as colour-blocks since we have no licensed product photos). |
| `Icons.jsx`       | Inline Heroicons (outline) used by every component.                                                                           |
| `Brand.jsx`       | `<LogoSquare>` and `<Wordmark>`.                                                                                              |
| `Navbar.jsx`      | Floating pill nav: brand, links, search, cart count.                                                                          |
| `ProductCard.jsx` | The signature tile — pink-tinted hover lift + tilt + ring.                                                                    |
| `HeroGrid.jsx`    | 3-item homepage mosaic (1 full + 2 half).                                                                                     |
| `Carousel.jsx`    | Marquee carousel of cards.                                                                                                    |
| `ProductPage.jsx` | PDP layout — `Gallery`, `ProductDescription`, `VariantSelector`, `AddToCart`.                                                 |
| `SearchPage.jsx`  | Collections sidebar + sort list + product grid.                                                                               |
| `CartModal.jsx`   | Slide-in drawer with line items, totals, checkout.                                                                            |
| `Footer.jsx`      | Footer with brand, menu, attribution.                                                                                         |
| `App.jsx`         | Routes between Home / Search / Product. Holds cart state.                                                                     |

## Coverage gaps (intentional)

- **Product images are colour-block placeholders.** No licensed Funko / trading-card / figure imagery in the project. Replace `data.jsx` and any `<ProductImage>` use with real `<img src>` when shipping.
- **No checkout flow past the drawer.** "Proceed to Checkout" is a no-op.
- **No auth / account UI** — the source has none either.
- **Mobile menu is omitted** — the source has one (`mobile-menu.tsx`); I focused on desktop because the storefront is built desktop-first.
