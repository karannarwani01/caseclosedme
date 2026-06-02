import type { Product } from "lib/shopify/types";

// ─────────────────────────────────────────────────────────────────────────
// TEMPORARY design-preview data. The live store currently has one imageless,
// sold-out product, so the browse pages look bare. Flip the flag below to
// false (or delete the demo branch in the browse pages) to return to live
// Shopify data. This file touches nothing in Shopify.
//
// Each product's tags carry: one CATEGORY tag, one SERIES tag, and optional
// badge tags (new | vault | preorder | sale). Facets/filters read these.
// ─────────────────────────────────────────────────────────────────────────
// Single source of truth: the USE_DEMO_PRODUCTS env var (see .env.local).
export const USE_DEMO_PRODUCTS = process.env.USE_DEMO_PRODUCTS === "true";

const CURRENCY = "AED";

function mk(
  handle: string,
  title: string,
  price: number,
  tags: string[],
  available = true,
): Product {
  const amount = price.toFixed(2);
  const money = { amount, currencyCode: CURRENCY };
  return {
    id: `demo-${handle}`,
    handle,
    title,
    availableForSale: available,
    description: "Demo preview product.",
    descriptionHtml: "<p>Demo preview product.</p>",
    options: [],
    priceRange: { maxVariantPrice: money, minVariantPrice: money },
    variants: [],
    images: [],
    featuredImage: { url: "", altText: title, width: 0, height: 0 },
    seo: { title, description: title },
    tags,
    updatedAt: new Date().toISOString(),
  };
}

export const DEMO_PRODUCTS: Product[] = [
  mk("charizard-holo-psa9", "Charizard — Holographic, PSA 9", 1499, [
    "Trading Cards",
    "Pokémon",
    "vault",
  ]),
  mk("luffy-gear-5-1525", "Luffy Gear 5 — Funko Pop #1525", 89, [
    "Funko Pops",
    "Anime",
    "new",
  ]),
  mk("spiderman-glow-chase", "Spider-Man — Glow Chase", 145, [
    "Funko Pops",
    "Marvel",
    "new",
  ]),
  mk("naruto-sage-figure", "Naruto Sage Mode — 1/7 Figure", 420, [
    "Figures",
    "Anime",
    "preorder",
  ]),
  mk("pikachu-vmax-box", "Pikachu VMAX — Sealed Box", 320, [
    "Trading Cards",
    "Pokémon",
    "sale",
  ]),
  mk("goku-ui-statue", "Goku Ultra Instinct — Statue", 760, [
    "Figures",
    "Anime",
    "vault",
  ]),
  mk("demon-slayer-blindbox", "Demon Slayer — Blind Box", 39, [
    "Blind Box",
    "Anime",
    "new",
  ]),
  mk("batman-1989-retro", "Batman 1989 — Retro Pop", 65, [
    "Funko Pops",
    "DC",
    "sale",
  ]),
  mk("eevee-evolutions-slabs", "Eevee Evolutions — Slab Set", 980, [
    "Trading Cards",
    "Pokémon",
    "vault",
  ]),
  mk("gundam-rx78-model", "Gundam RX-78-2 — Master Grade", 210, [
    "Figures",
    "Anime",
  ]),
  mk(
    "pochita-plush",
    "Pochita — Collector Plush",
    55,
    ["Novelty", "Anime"],
    false,
  ),
  mk("gojo-satoru-figure", "Gojo Satoru — Limited Figure", 540, [
    "Figures",
    "Anime",
    "preorder",
  ]),
  mk("snow-white-diorama", "Snow White — Deluxe Diorama", 1399, [
    "Figures",
    "Disney",
    "new",
  ]),
  mk("stormtrooper-bust", "Stormtrooper — 1/4 Scale Bust", 349, [
    "Figures",
    "Star Wars",
  ]),
  mk("grogu-flocked-470", "Grogu — Flocked Pop! #470", 95, [
    "Funko Pops",
    "Star Wars",
    "new",
  ]),
  mk("joker-statue", "Joker — 1/6 Statue", 525, ["Figures", "DC", "vault"]),
  mk("topps-chrome-marvel", "Topps Chrome — Marvel Box", 189, [
    "Trading Cards",
    "Marvel",
  ]),
  mk("nba-prizm-2024", "NBA Prizm 2024 — Retail Pack", 27, [
    "Trading Cards",
    "Sports",
    "sale",
  ]),
  mk("iron-man-mk85", "Iron Man Mark 85 — Diecast", 430, [
    "Figures",
    "Marvel",
    "preorder",
  ]),
  mk("darth-vader-pop", "Darth Vader — Glow Pop! #157", 72, [
    "Funko Pops",
    "Star Wars",
  ]),
  mk("monchicchi-pouch", "Monchicchi — Plush Pouch", 119, [
    "Novelty",
    "Disney",
    "new",
  ]),
  mk("one-piece-zoro-pop", "Zoro — Funko Pop! #1290", 79, [
    "Funko Pops",
    "Anime",
  ]),
];

// Match a collection handle to demo products by category tag, so collection
// pages also populate under the preview flag.
const COLLECTION_TAG: Record<string, string> = {
  funko: "Funko Pops",
  "funko-pops": "Funko Pops",
  figures: "Figures",
  "trading-cards": "Trading Cards",
  "blind-box": "Blind Box",
  novelty: "Novelty",
};

export function filterDemoByCollection(handle: string): Product[] {
  const tag = COLLECTION_TAG[handle];
  if (!tag) {
    if (handle === "vault")
      return DEMO_PRODUCTS.filter((p) => p.tags.includes("vault"));
    return DEMO_PRODUCTS;
  }
  return DEMO_PRODUCTS.filter((p) => p.tags.includes(tag));
}
