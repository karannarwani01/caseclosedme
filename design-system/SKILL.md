---
name: caseclosed-design
description: Use this skill to generate well-branded interfaces and assets for Case Closed (caseclosed.me), a pop-culture collectibles storefront, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files (`colors_and_type.css`, `assets/`, `ui_kits/storefront/`, `preview/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of this skill and create static HTML files for the user to view. Link `colors_and_type.css` directly and pull components from `ui_kits/storefront/` as composable JSX you can adapt.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand — the `@theme` block in `colors_and_type.css` mirrors the canonical Tailwind v4 tokens from the live storefront.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (audience, surface, fidelity, options), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key brand reminders:
- **Voice:** plain, warm, collector-to-collector. Sentence case. Second person. No emoji in UI.
- **Palette:** cream `#fff8f0` page, navy `#1a1a2e` ink, pink `#ff3d7f` primary, cyan `#5bc0eb` secondary, cream-2 `#ffeed9` tinted surfaces, yellow `#ffd93d` highlights.
- **Type:** Bricolage Grotesque (display) + Inter (body). Tightened tracking on big headings.
- **Shape language:** pills (`9999px`) and 28px cards. Hairline `--ink-10` borders. Pink-tinted hover shadow is the signature.
- **Motion:** product cards lift + micro-tilt -0.5deg + pink shadow + 1.05 image scale on hover.
- **Two logo variants:** the friendly `cc` square inside UI; the pixel-art mark on marketing/packaging.
