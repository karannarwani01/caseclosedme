import type { Product } from "lib/shopify/types";

// Tag vocabularies the Feed filters understand. Live Shopify products should
// carry matching tags; anything outside these lists is ignored by the facets.
export const CATEGORY_TAGS = [
  "Funko Pops",
  "Trading Cards",
  "Figures",
  "Blind Box",
  "Novelty",
];

export const SERIES_TAGS = [
  "Pokémon",
  "Marvel",
  "Anime",
  "Star Wars",
  "DC",
  "Disney",
  "Sports",
];

export type Facet = { label: string; count: number };

function countTag(products: Product[], tag: string): number {
  return products.filter((p) => p.tags.includes(tag)).length;
}

export function buildFacets(products: Product[]): {
  categories: Facet[];
  series: Facet[];
} {
  const facetsFor = (tags: string[]) =>
    tags
      .map((label) => ({ label, count: countTag(products, label) }))
      .filter((f) => f.count > 0);
  return {
    categories: facetsFor(CATEGORY_TAGS),
    series: facetsFor(SERIES_TAGS),
  };
}

// The series/brand line shown under a card title.
export function seriesOf(product: Product): string | undefined {
  return (
    SERIES_TAGS.find((s) => product.tags.includes(s)) ||
    CATEGORY_TAGS.find((c) => product.tags.includes(c)) ||
    product.tags[0]
  );
}
