// Fake catalog for the prototype. No images — each product has a "swatch" pair
// rendered by ProductImage as a soft duotone placeholder. Replace with real
// <img src> on production.

const PRODUCTS = [
  {
    handle: "charizard-holo-psa9",
    title: "Charizard — Holographic, PSA 9",
    category: "Trading Cards",
    price: 1299.0,
    swatch: ["#ff6b3d", "#ffd93d"],
    badge: "PSA 9",
    description:
      "1999 Base Set Holofoil. Centered, sharp corners, faint whitening on one edge. Slabbed by PSA, label intact.",
    variants: [{ name: "Condition", values: ["Mint", "Near Mint", "Played"] }],
  },
  {
    handle: "pikachu-pop-vinyl",
    title: "Pikachu — Pop! Vinyl #353",
    category: "Funko Pops",
    price: 24.0,
    swatch: ["#ffd93d", "#5bc0eb"],
    badge: "New",
    description:
      "Funko Pop! Games figure. Window box, never opened. Hand-checked for paint defects.",
    variants: [
      { name: "Edition", values: ["Standard", "Glitter", "Diamond"] },
      { name: "Box", values: ["Mint", "Slight wear"] },
    ],
  },
  {
    handle: "stormtrooper-bust",
    title: "Stormtrooper — 1/4 scale bust",
    category: "Figures",
    price: 349.0,
    swatch: ["#1a1a2e", "#5bc0eb"],
    badge: "Pre-order",
    description:
      "Hand-painted resin. 9-inch bust on a matte black base. Numbered edition of 750.",
    variants: [{ name: "Edition", values: ["Standard", "Signature"] }],
  },
  {
    handle: "blastoise-vmax",
    title: "Blastoise VMAX — Full art",
    category: "Trading Cards",
    price: 89.0,
    swatch: ["#5bc0eb", "#ff3d7f"],
    description:
      "Sword & Shield era. Sleeved, top-loaded, sent in a bubble mailer.",
    variants: [{ name: "Condition", values: ["Mint", "Near Mint"] }],
  },
  {
    handle: "baby-yoda-flocked",
    title: "Grogu — Flocked Pop! #470",
    category: "Funko Pops",
    price: 32.0,
    swatch: ["#a3c98a", "#ffeed9"],
    description: "Convention exclusive. Sticker intact.",
    variants: [{ name: "Edition", values: ["Flocked", "Standard"] }],
  },
  {
    handle: "joker-statue",
    title: "Joker — 1/6 statue",
    category: "Figures",
    price: 525.0,
    swatch: ["#7a3dc2", "#ffd93d"],
    badge: "−15%",
    salePrice: 446.25,
    description:
      "12-inch polystone. Two interchangeable head sculpts, three pairs of hands.",
    variants: [{ name: "Edition", values: ["Regular", "Deluxe"] }],
  },
  {
    handle: "deadpool-skateboard",
    title: "Deadpool — skateboard Pop! #531",
    category: "Funko Pops",
    price: 28.0,
    swatch: ["#ff3d7f", "#1a1a2e"],
    description: "Hot Topic exclusive. Boxed, mint.",
    variants: [{ name: "Edition", values: ["Standard"] }],
  },
  {
    handle: "lugia-vstar",
    title: "Lugia VSTAR — Silver Tempest",
    category: "Trading Cards",
    price: 145.0,
    swatch: ["#cfe7f6", "#1a1a2e"],
    description: "Rainbow rare. Top-loaded, sleeved.",
    variants: [{ name: "Condition", values: ["Mint", "Near Mint"] }],
  },
];

const COLLECTIONS = [
  { slug: null, title: "All products" },
  { slug: "funko-pops", title: "Funko Pops" },
  { slug: "trading-cards", title: "Trading Cards" },
  { slug: "figures", title: "Figures" },
  { slug: "just-dropped", title: "Just dropped" },
  { slug: "sale", title: "Sale" },
];

const SORT_OPTIONS = [
  { slug: null, title: "Relevance" },
  { slug: "trending-desc", title: "Trending" },
  { slug: "latest-desc", title: "Latest arrivals" },
  { slug: "price-asc", title: "Price: Low to high" },
  { slug: "price-desc", title: "Price: High to low" },
];

window.PRODUCTS = PRODUCTS;
window.COLLECTIONS = COLLECTIONS;
window.SORT_OPTIONS = SORT_OPTIONS;

window.formatPrice = function (amount, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
};

window.findProduct = function (handle) {
  return PRODUCTS.find((p) => p.handle === handle);
};
