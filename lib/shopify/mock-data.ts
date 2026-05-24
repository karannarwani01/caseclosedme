import type { Product } from "./types";

export type MockProduct = Product & {
  swatch: [string, string];
  badge?: string;
  salePrice?: string;
};

function makeProduct(p: {
  handle: string;
  title: string;
  description: string;
  price: string;
  salePrice?: string;
  swatch: [string, string];
  badge?: string;
  category: string;
}): MockProduct {
  const now = new Date().toISOString();
  return {
    id: `mock/${p.handle}`,
    handle: p.handle,
    availableForSale: true,
    title: p.title,
    description: p.description,
    descriptionHtml: `<p>${p.description}</p>`,
    options: [
      {
        id: "default",
        name: "Title",
        values: ["Default Title"],
      },
    ],
    priceRange: {
      maxVariantPrice: { amount: p.salePrice ?? p.price, currencyCode: "USD" },
      minVariantPrice: { amount: p.salePrice ?? p.price, currencyCode: "USD" },
    },
    variants: [
      {
        id: `mock-variant/${p.handle}`,
        title: "Default Title",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default Title" }],
        price: { amount: p.salePrice ?? p.price, currencyCode: "USD" },
      },
    ],
    featuredImage: {
      url: "",
      altText: p.title,
      width: 800,
      height: 800,
    },
    images: [],
    seo: { title: p.title, description: p.description },
    tags: [p.category],
    updatedAt: now,
    swatch: p.swatch,
    badge: p.badge,
    salePrice: p.salePrice,
  };
}

export const MOCK_PRODUCTS: MockProduct[] = [
  makeProduct({
    handle: "charizard-holo-psa9",
    title: "Charizard — Holographic, PSA 9",
    category: "Trading Cards",
    price: "1299.00",
    swatch: ["#ff6b3d", "#ffd93d"],
    badge: "PSA 9",
    description:
      "1999 Base Set Holofoil. Centered, sharp corners, faint whitening on one edge. Slabbed by PSA, label intact.",
  }),
  makeProduct({
    handle: "pikachu-pop-vinyl",
    title: "Pikachu — Pop! Vinyl #353",
    category: "Funko Pops",
    price: "24.00",
    swatch: ["#ffd93d", "#5bc0eb"],
    badge: "New",
    description:
      "Funko Pop! Games figure. Window box, never opened. Hand-checked for paint defects.",
  }),
  makeProduct({
    handle: "stormtrooper-bust",
    title: "Stormtrooper — 1/4 scale bust",
    category: "Figures",
    price: "349.00",
    swatch: ["#1a1a2e", "#5bc0eb"],
    badge: "Pre-order",
    description:
      "Hand-painted resin. 9-inch bust on a matte black base. Numbered edition of 750.",
  }),
  makeProduct({
    handle: "blastoise-vmax",
    title: "Blastoise VMAX — Full art",
    category: "Trading Cards",
    price: "89.00",
    swatch: ["#5bc0eb", "#ff3d7f"],
    description:
      "Sword & Shield era. Sleeved, top-loaded, sent in a bubble mailer.",
  }),
  makeProduct({
    handle: "baby-yoda-flocked",
    title: "Grogu — Flocked Pop! #470",
    category: "Funko Pops",
    price: "32.00",
    swatch: ["#a3c98a", "#ffeed9"],
    description: "Convention exclusive. Sticker intact.",
  }),
  makeProduct({
    handle: "joker-statue",
    title: "Joker — 1/6 statue",
    category: "Figures",
    price: "525.00",
    salePrice: "446.25",
    swatch: ["#7a3dc2", "#ffd93d"],
    badge: "−15%",
    description:
      "12-inch polystone. Two interchangeable head sculpts, three pairs of hands.",
  }),
  makeProduct({
    handle: "deadpool-skateboard",
    title: "Deadpool — skateboard Pop! #531",
    category: "Funko Pops",
    price: "28.00",
    swatch: ["#ff3d7f", "#1a1a2e"],
    description: "Hot Topic exclusive. Boxed, mint.",
  }),
  makeProduct({
    handle: "lugia-vstar",
    title: "Lugia VSTAR — Silver Tempest",
    category: "Trading Cards",
    price: "145.00",
    swatch: ["#cfe7f6", "#1a1a2e"],
    description: "Rainbow rare. Top-loaded, sleeved.",
  }),
  makeProduct({
    handle: "naruto-sasuke-bust",
    title: "Naruto vs Sasuke — 1/4 diorama",
    category: "Figures",
    price: "459.00",
    swatch: ["#ff6a1f", "#1ee3ff"],
    badge: "Hot",
    description: "Resin diorama, hand-painted. Limited 500.",
  }),
  makeProduct({
    handle: "luffy-gear5-pop",
    title: "Luffy Gear 5 — Pop! #1525",
    category: "Funko Pops",
    price: "38.00",
    swatch: ["#c4ff3d", "#ff2e93"],
    badge: "Just dropped",
    description: "Convention exclusive. Glow-in-the-dark variant.",
  }),
];

export function getMockProductsForCollection(collection: string): MockProduct[] {
  if (collection === "hidden-homepage-featured-items") {
    return MOCK_PRODUCTS.slice(0, 3);
  }
  if (collection === "hidden-homepage-carousel") {
    return MOCK_PRODUCTS.slice(2);
  }
  if (collection === "just-arrived") {
    return [
      MOCK_PRODUCTS[1]!, // Pikachu (New)
      MOCK_PRODUCTS[9]!, // Luffy Gear 5 (Just dropped)
      MOCK_PRODUCTS[8]!, // Naruto vs Sasuke (Hot)
      MOCK_PRODUCTS[6]!, // Deadpool
      MOCK_PRODUCTS[4]!, // Grogu
      MOCK_PRODUCTS[3]!, // Blastoise
    ];
  }
  if (collection === "top-10") {
    return MOCK_PRODUCTS.slice(0, 10);
  }
  return MOCK_PRODUCTS;
}
