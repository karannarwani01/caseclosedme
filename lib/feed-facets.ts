import type { Product } from "lib/shopify/types";

export type Facet = { value: string; label: string; count: number };
export type FacetField =
  | "type"
  | "protector"
  | "line"
  | "format"
  | "vendor"
  | "franchise"
  | "size"
  | "color";
export type FacetGroup = {
  key: string;
  title: string;
  accent: string;
  dark?: boolean;
  field: FacetField;
  options: Facet[];
};

// Normalize a tag so "One Piece", "One-Piece" and "one-piece" all collapse.
const norm = (s: string) => s.toLowerCase().replace(/[\s_]+/g, "-");

// Franchise tag (normalized) -> display label. Several keys can map to one
// label (e.g. dragon-ball / dragon-ball-z).
const FRANCHISES: Record<string, string> = {
  "one-piece": "One Piece",
  "dragon-ball": "Dragon Ball",
  "dragon-ball-z": "Dragon Ball",
  "dragon-ball-super": "Dragon Ball",
  pokemon: "Pokémon",
  naruto: "Naruto",
  bleach: "Bleach",
  "demon-slayer": "Demon Slayer",
  "attack-on-titan": "Attack on Titan",
  "my-hero-academia": "My Hero Academia",
  marvel: "Marvel",
  dc: "DC",
  "harry-potter": "Harry Potter",
  disney: "Disney",
  pixar: "Disney",
  "star-wars": "Star Wars",
  godzilla: "Godzilla",
};

const VENDOR_LABELS: Record<string, string> = { Popmart: "Pop Mart" };
const prettyVendor = (v: string) => VENDOR_LABELS[v] || v;

// Primary colour, from a `color-*` tag on the product.
const COLORS: Record<string, string> = {
  "color-red": "Red",
  "color-blue": "Blue",
  "color-green": "Green",
  "color-black": "Black",
  "color-pink": "Pink",
  "color-yellow": "Yellow",
  "color-orange": "Orange",
  "color-purple": "Purple",
  "color-white": "White",
  "color-grey": "Grey",
  "color-brown": "Brown",
  "color-multi": "Multicolour",
};

function colorLabelsOf(p: Product): string[] {
  const labels = new Set<string>();
  for (const t of p.tags) {
    const label = COLORS[norm(t)];
    if (label) labels.add(label);
  }
  return [...labels];
}

function franchiseLabelsOf(p: Product): string[] {
  const labels = new Set<string>();
  for (const t of p.tags) {
    const label = FRANCHISES[norm(t)];
    if (label) labels.add(label);
  }
  return [...labels];
}

// Figure size/format, from a `size-*` tag on the product (a real Shopify field).
const SIZES: Record<string, string> = {
  "size-standard": "Standard Pop!",
  "size-2-pack": "2-Pack",
  "size-4-pack": "4-Pack",
  "size-plus": "Pop! Plus",
  "size-jumbo": "Jumbo",
  "size-mega": "Mega (400%)",
  "size-statue": "Statue / Scale",
  "size-blind-box": "Blind Box",
  "size-designer": "Designer Toy",
};

function sizeOf(p: Product): string {
  for (const t of p.tags) {
    const label = SIZES[norm(t)];
    if (label) return label;
  }
  return "";
}

// Die-cast line/format, from a tag on the product. Drives the "Type" facet on
// car pages instead of productType (which there is just the brand, e.g. Hot
// Wheels / Jada — already covered by the Brand facet). A product can carry more
// than one (e.g. a Premium 2-Pack). LINE_ORDER fixes the display order.
const LINES: Record<string, string> = {
  mainline: "Mainline",
  premium: "Premium",
  "2-pack": "2 Pack",
  "team-transport": "Team Transport",
};
const LINE_ORDER = ["Mainline", "Premium", "2 Pack", "Team Transport"];

function lineLabelsOf(p: Product): string[] {
  const labels = new Set<string>();
  for (const t of p.tags) {
    const label = LINES[norm(t)];
    if (label) labels.add(label);
  }
  return [...labels];
}

// Sealed trading-card format, from a tag on the product. Drives the "Type"
// facet on card pages — there productType is just "Trading Cards", so the
// normal Type facet never shows. CARD_FORMAT_ORDER fixes the display order.
const CARD_FORMATS: Record<string, string> = {
  "booster-box": "Booster Box",
  blister: "Blister",
  display: "Display",
  "elite-trainer-box": "Elite Trainer Box",
  "single-pack": "Single Pack",
};
const CARD_FORMAT_ORDER = [
  "Booster Box",
  "Elite Trainer Box",
  "Display",
  "Blister",
  "Single Pack",
];

function cardFormatLabelsOf(p: Product): string[] {
  const labels = new Set<string>();
  for (const t of p.tags) {
    const label = CARD_FORMATS[norm(t)];
    if (label) labels.add(label);
  }
  return [...labels];
}

// Protector category, from the `<cat>-protectors` tag. Drives the "Type" facet
// on protector pages (Funko / TCG / Hot Wheels) — protectors all share one
// productType ("Protector"), so the normal Type facet never appears.
const PROTECTOR_TYPES: Record<string, string> = {
  "funko-protectors": "Funko",
  "tcg-protectors": "TCG",
  "hot-wheels-protectors": "Hot Wheels",
};
const PROTECTOR_ORDER = ["Funko", "TCG", "Hot Wheels"];

function protectorTypeLabelsOf(p: Product): string[] {
  const labels = new Set<string>();
  for (const t of p.tags) {
    const label = PROTECTOR_TYPES[norm(t)];
    if (label) labels.add(label);
  }
  return [...labels];
}

// Does a product match a chosen facet value?
export function matchesFacet(
  p: Product,
  field: FacetField,
  value: string,
): boolean {
  if (field === "type") return p.productType === value;
  if (field === "protector") return protectorTypeLabelsOf(p).includes(value);
  if (field === "line") return lineLabelsOf(p).includes(value);
  if (field === "format") return cardFormatLabelsOf(p).includes(value);
  if (field === "vendor") return prettyVendor(p.vendor) === value;
  if (field === "franchise") return franchiseLabelsOf(p).includes(value);
  if (field === "size") return sizeOf(p) === value;
  if (field === "color") return colorLabelsOf(p).includes(value);
  return false;
}

function tally(map: Map<string, number>): Facet[] {
  return [...map.entries()]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

// Build the filter groups straight from the products on the page, so they
// always reflect what's actually there.
export function buildFacetGroups(products: Product[]): FacetGroup[] {
  const types = new Map<string, number>();
  const protectorTypes = new Map<string, number>();
  const lines = new Map<string, number>();
  const cardFormats = new Map<string, number>();
  const franchises = new Map<string, number>();
  const vendors = new Map<string, number>();
  const sizes = new Map<string, number>();
  const colors = new Map<string, number>();

  const bump = (m: Map<string, number>, k: string) => {
    if (k) m.set(k, (m.get(k) || 0) + 1);
  };

  for (const p of products) {
    bump(types, p.productType);
    bump(vendors, prettyVendor(p.vendor));
    bump(sizes, sizeOf(p));
    for (const label of protectorTypeLabelsOf(p)) bump(protectorTypes, label);
    for (const label of lineLabelsOf(p)) bump(lines, label);
    for (const label of cardFormatLabelsOf(p)) bump(cardFormats, label);
    for (const label of franchiseLabelsOf(p)) bump(franchises, label);
    for (const label of colorLabelsOf(p)) bump(colors, label);
  }

  const groups: FacetGroup[] = [];
  const push = (
    key: string,
    title: string,
    accent: string,
    field: FacetField,
    map: Map<string, number>,
    opts: { minOptions?: number; dark?: boolean } = {},
  ) => {
    const options = tally(map);
    if (options.length >= (opts.minOptions ?? 1))
      groups.push({ key, title, accent, field, options, dark: opts.dark });
  };

  // "Type" facet: on protector pages, use the protector-category tags (Funko /
  // TCG / Hot Wheels) — they share one productType so the normal Type facet
  // never shows. On car pages, use the die-cast line tags (Mainline, Premium,
  // 2 Pack, Team Transport) in a fixed order; otherwise fall back to the
  // product's productType. Cars set productType to the brand (Hot Wheels /
  // Jada), which already lives under the Brand facet, so we don't repeat it.
  if (protectorTypes.size > 1) {
    const options = [...protectorTypes.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort(
        (a, b) =>
          PROTECTOR_ORDER.indexOf(a.label) - PROTECTOR_ORDER.indexOf(b.label),
      );
    groups.push({
      key: "type",
      title: "Type",
      accent: "var(--color-anime-cyan)",
      field: "protector",
      options,
    });
  } else if (lines.size > 0) {
    const options = [...lines.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort(
        (a, b) => LINE_ORDER.indexOf(a.label) - LINE_ORDER.indexOf(b.label),
      );
    groups.push({
      key: "type",
      title: "Type",
      accent: "var(--color-anime-cyan)",
      field: "line",
      options,
    });
  } else if (cardFormats.size > 0) {
    const options = [...cardFormats.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort(
        (a, b) =>
          CARD_FORMAT_ORDER.indexOf(a.label) -
          CARD_FORMAT_ORDER.indexOf(b.label),
      );
    groups.push({
      key: "type",
      title: "Type",
      accent: "var(--color-anime-cyan)",
      field: "format",
      options,
    });
  } else {
    // Only show Type when there's more than one productType to choose.
    push("type", "Type", "var(--color-anime-cyan)", "type", types, {
      minOptions: 2,
    });
  }
  push(
    "license",
    "License",
    "var(--color-anime-pink)",
    "franchise",
    franchises,
  );
  push("brand", "Brand", "var(--color-anime-lime)", "vendor", vendors, {
    minOptions: 2,
  });
  push("size", "Size", "var(--color-anime-orange)", "size", sizes, {
    minOptions: 2,
  });
  push("color", "Colour", "var(--color-anime-purple)", "color", colors, {
    dark: true,
  });
  return groups;
}

// The series/brand line shown under a card title.
export function seriesOf(product: Product): string | undefined {
  const f = franchiseLabelsOf(product);
  if (f.length) return f[0];
  return product.productType || prettyVendor(product.vendor) || undefined;
}
