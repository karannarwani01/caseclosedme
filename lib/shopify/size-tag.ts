// Pick a `size-*` tag for a product from its title + product type. Mirrors the
// manual size assignments; used by the products webhook to auto-tag new items.
// Returns null when no sensible size applies (e.g. trading cards).
export function sizeTagFor(title: string, productType: string): string | null {
  const t = (title || "").toLowerCase();
  if (/\b2[- ]?pack\b/.test(t)) return "size-2-pack";
  if (/\b400%|\bmega\b/.test(t)) return "size-mega";
  if (/grandista|statue|nero|\b1\/\d|\bscale\b/.test(t)) return "size-statue";
  if (/pop!? plus|\bjumbo\b|super[- ]?sized|\bplus\b/.test(t))
    return "size-jumbo";
  if (productType === "Blind Box") return "size-blind-box";
  if (productType === "Designer Toy") return "size-designer";
  if (productType === "Funko Pop") return "size-standard";
  if (productType === "Anime Figure") return "size-statue";
  return null;
}
