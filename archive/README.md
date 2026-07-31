# archive/

Code that is no longer reachable from any Next.js entry point, kept here rather
than deleted so it can be read or restored later.

Nothing in this directory is compiled or shipped: `archive` is listed in
`tsconfig.json` `exclude`, and no file outside it imports anything inside it.

## How this set was chosen

Not by grepping for unused names — that produces false positives. An import
graph was walked from every Next.js entry point (`app/**/page|layout|route|
not-found|error|opengraph-image|sitemap|robots|actions`, plus `middleware`),
following both absolute (`components/…`, `lib/…`) and relative imports, and
anything never reached was collected.

Two traps that caught earlier attempts:

- **Relative imports.** `lib/shopify/fragments/{cart,image,seo}.ts` look dead to
  a path-based scan because they are imported as `./fragments/image`. They are
  live.
- **Config references.** `lib/shopify-image-loader.ts` is unreachable through
  imports but is named in `next.config.ts` as `images.loaderFile`. Archiving it
  would break every image on the site. It stayed.

## What's here (2026-07-31)

Leftovers from the Next.js Commerce starter that the redesign replaced.

| file                                           | exports                        | replaced by                                                 |
| ---------------------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| `components/carousel.tsx`                      | `Carousel`                     | `components/hero-carousel.tsx`, `components/scroll-row.tsx` |
| `components/editorial/browse-masthead.tsx`     | `BrowseMasthead`               | `components/feed/*`                                         |
| `components/grid/three-items.tsx`              | `ThreeItemGrid`                | `components/section-row.tsx`                                |
| `components/icons/logo.tsx`                    | `LogoIcon`                     | `components/logo-square.tsx`, `components/logo-lockup.tsx`  |
| `components/layout/footer-menu.tsx`            | `FooterMenu`, `FooterMenuItem` | hardcoded columns in `components/layout/footer.tsx`         |
| `components/layout/product-grid-items.tsx`     | `ProductGridItems`             | `components/feed/feed-card.tsx`                             |
| `components/layout/search/collections.tsx`     | `Collections`                  | `components/feed/feed-filters.tsx`                          |
| `components/layout/search/filter/index.tsx`    | `FilterList`                   | `components/feed/feed-filters.tsx`                          |
| `components/layout/search/filter/item.tsx`     | `FilterItem`                   | `components/feed/feed-filters.tsx`                          |
| `components/layout/search/filter/dropdown.tsx` | `FilterItemDropdown`           | `components/feed/feed-filters.tsx`                          |
| `components/welcome-toast.tsx`                 | `WelcomeToast`                 | never used on this store                                    |

The `search/filter/*` tree came out as a unit: only `search/collections.tsx`
imported it, and nothing imported that.

## Restoring one

```bash
git mv archive/components/<file> components/<file>
```

Then fix its imports — relative paths shift by one level under `archive/` — and
check it against the current design before wiring it up. Most of these render
the pre-redesign look.

## Re-running the scan

The import-graph walk is not committed. Rebuild it by walking `git ls-files`
from the entry points above; anything under `components/` or `lib/` that isn't
reached is a candidate. Always hand-check config-referenced files first.
