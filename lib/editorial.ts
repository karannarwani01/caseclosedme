// Curated editorial copy for the browse/collection "magazine" treatment.
// Shopify stores titles, prices, images and tags — not issue numbers, blurbs
// or pull quotes. This module supplies that prose so the editorial layout
// reads finished while products/prices stay live. Swap copy freely.

export const ISSUE = {
  no: "14",
  date: "May 2026",
  tagline: "A pop-culture collectibles magazine — that also sells the pieces.",
};

export type Department = {
  eyebrow: string;
  blurb: string;
};

const DEPARTMENTS: Record<string, Department> = {
  "funko-pops": {
    eyebrow: "Department 01",
    blurb: "Chases, exclusives and grails — boxed, mint, and hand-checked.",
  },
  "trading-cards": {
    eyebrow: "Department 02",
    blurb: "Slabbed, certified and serialized. Centering called honestly.",
  },
  figures: {
    eyebrow: "Department 03",
    blurb: "Anime scales and statues, sourced and packed with care.",
  },
  vault: {
    eyebrow: "The Vault",
    blurb: "Limited releases and grails — the pieces we'd rather keep.",
  },
  "just-arrived": {
    eyebrow: "New this week",
    blurb: "Fresh off the truck — the latest pieces to land in the case.",
  },
  "top-10": {
    eyebrow: "Collector's choice",
    blurb: "This week's most-hunted, ranked by the people doing the hunting.",
  },
};

export function departmentFor(
  handle: string,
  fallbackTitle?: string,
): Department {
  return (
    DEPARTMENTS[handle] ?? {
      eyebrow: "Department",
      blurb: `Every ${fallbackTitle ?? "piece"} in the case — hand-checked and packed in bubble.`,
    }
  );
}

export type FeedBadge = {
  label: string;
  // CSS color values (token vars) for the starburst fill + text.
  bg: string;
  color: string;
};

// Derive a sticker badge from a product's Shopify tags. First match wins.
export function badgeForTags(tags: string[]): FeedBadge | null {
  const t = tags.map((x) => x.toLowerCase());
  const has = (...needles: string[]) =>
    t.some((tag) => needles.some((n) => tag.includes(n)));

  if (has("vault", "grail", "rare"))
    return {
      label: "Vault",
      bg: "var(--color-anime-ink)",
      color: "var(--color-anime-yellow)",
    };
  if (has("preorder", "pre-order", "pre order"))
    return {
      label: "Pre Order",
      bg: "var(--color-anime-cyan)",
      color: "var(--color-anime-ink)",
    };
  if (has("sale", "deal"))
    return { label: "On Sale", bg: "var(--color-anime-pink)", color: "#fff" };
  if (has("new", "arrival", "drop"))
    return {
      label: "New Arrival",
      bg: "var(--color-anime-yellow)",
      color: "var(--color-anime-ink)",
    };
  return null;
}
