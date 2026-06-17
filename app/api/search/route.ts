import { getProducts } from "lib/shopify";
import { getTrendingSearchTerms } from "lib/shopify-admin";
import { NextRequest, NextResponse } from "next/server";

// Tag-aware autocomplete: matches the query against title, type, vendor,
// handle AND every tag (same logic as /search), returns the top hits as JSON.
type Hit = { handle: string; title: string; image: string; price: string };

const toHit = (p: {
  handle: string;
  title: string;
  featuredImage?: { url: string } | null;
  priceRange: { maxVariantPrice: { amount: string } };
}): Hit => ({
  handle: p.handle,
  title: p.title,
  image: p.featuredImage?.url ?? "",
  price: p.priceRange.maxVariantPrice.amount,
});

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").toLowerCase().trim();

  // No query yet → return trending (best-selling) products + the admin-managed
  // trending search terms for the search overlay's empty state.
  if (q.length < 2) {
    const [top, terms] = await Promise.all([
      getProducts({ sortKey: "BEST_SELLING" }),
      getTrendingSearchTerms(),
    ]);
    return NextResponse.json({
      results: [],
      trending: top.slice(0, 6).map(toHit),
      terms,
    });
  }

  // Normalize away hyphens so "die-cast" matches the "diecast" tag, etc.
  const norm = (s: string) => s.toLowerCase().replace(/-/g, "");
  const tokens = q.split(/\s+/).filter(Boolean).map(norm);
  const all = await getProducts({});

  const results = all
    .filter((p) => {
      const haystack = norm(
        [p.title, p.productType, p.vendor, p.handle, ...p.tags].join(" "),
      );
      return tokens.every((t) => haystack.includes(t));
    })
    .slice(0, 7)
    .map(toHit);

  return NextResponse.json({ results, trending: [] });
}
