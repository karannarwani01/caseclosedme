// Custom next/image loader: serve images straight from Shopify's CDN (which
// resizes on the fly via the `width` query param) instead of Vercel's
// /_next/image optimizer. The optimizer is quota-limited on the Hobby plan and
// starts returning HTTP 402 once the cap is hit, which breaks every image on
// the site. Shopify CDN resizing is free and unlimited, and the images already
// live there, so this removes the dependency entirely.

type ShopifyImageLoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

export default function shopifyImageLoader({
  src,
  width,
}: ShopifyImageLoaderArgs): string {
  // Local/static assets (/public) and data URLs: serve as-is. Shopify resizing
  // only applies to Shopify-hosted images.
  if (!src.startsWith("http")) return src;

  try {
    const url = new URL(src);
    // Shopify CDN supports on-the-fly resizing via `width`.
    if (
      url.hostname.endsWith("shopify.com") ||
      url.pathname.includes("/cdn/shop/")
    ) {
      url.searchParams.set("width", String(width));
      return url.toString();
    }
    // Any other remote host: hand back the original URL untouched.
    return src;
  } catch {
    return src;
  }
}
