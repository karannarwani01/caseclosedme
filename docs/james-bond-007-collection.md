# New: James Bond 007 collection + nav link

**Date:** 2026-06-12

## What was added

- **Smart collection "James Bond 007"** (handle `james-bond-007`).
  - Rule: `TAG EQUALS 007` (auto-updating — any future Funko tagged `007` joins automatically).
  - Currently 9 products (James Bond GoldenEye/Dr. No/Spy Who Loved Me, Golden Girl, Oddjob,
    Blofeld, Jaws, Nomi, Safin).
  - Sort order: price high→low. Cover image set (James Bond #693 front).
  - **Published to both Online Store and Caseclosed Headless** (so the headless storefront sees it).
- **Nav link** added in `components/layout/navbar/nav-menu.tsx` → `FUNKO_MEGA` → "License" section:
  `{ title: "James Bond 007", path: "/search/james-bond-007" }` (right after "Movies").

## Notes

- The collection is reachable at `/search/[collection]` like the other tag/collection pages.
- Nothing else changed. The link only renders in the Funko mega-panel on hover (client component),
  so it won't appear in static page HTML — that's expected.
