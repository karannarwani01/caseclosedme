import type { Metadata } from "next";

// The root layout sets a title template of `%s | ${SITE_NAME}`. Merchant-authored
// SEO titles in Shopify are written as complete titles and already end in
// "| caseclosed", so running them through the template produced
// "... | caseclosed | caseclosed" on every product and collection that had a
// curated SEO title.
//
// Only bypass the template when the brand is already there. A curated title
// without it still goes through the template, so it keeps picking up the brand.
export function seoPageTitle(
  seoTitle: string | null | undefined,
  fallback: string,
): Metadata["title"] {
  const title = seoTitle?.trim();
  if (!title) return fallback;

  const siteName = process.env.SITE_NAME?.trim();
  if (siteName) {
    const suffix = `| ${siteName}`.toLowerCase();
    if (title.toLowerCase().endsWith(suffix)) return { absolute: title };
  }

  return title;
}
