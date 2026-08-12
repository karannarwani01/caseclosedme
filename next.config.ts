export default {
  // Allow viewing the dev server from phones/other devices on the LAN without
  // the cross-origin /_next/* dev warning. Dev-only; ignored in production.
  allowedDevOrigins: ["192.168.0.139", "localhost"],
  // Next 16 merged `experimental.ppr` + `experimental.useCache` into this one
  // flag: Partial Prerendering and "use cache" are both enabled by it.
  // NOTE: `experimental.inlineCss` stays intentionally disabled. When enabled,
  // Next inlines the next/font `@font-face` rules into each page's HTML, where
  // their relative `src: url(../media/…)` resolves against the page URL (e.g.
  // /terms-conditions -> /media/… = 404) instead of /_next/static/media/….
  // That makes every webfont fail to load site-wide.
  cacheComponents: true,
  experimental: {
    serverActions: {
      // Refund-request photo uploads travel inside the Server Action body.
      // Vercel rejects bodies over ~4.5 MB at the platform layer, so this cap
      // (default 1 MB) is raised to just under it; the form compresses photos
      // client-side to stay within the budget.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Serve images via a custom loader (lib/shopify-image-loader) that resizes
    // through Shopify's own CDN, bypassing Vercel's /_next/image optimizer.
    // The optimizer is quota-capped on the Hobby plan and returns HTTP 402 once
    // exhausted, which breaks every image site-wide; Shopify CDN resizing is
    // free + unlimited. The settings below only matter for the built-in
    // optimizer and are ignored under a custom loader, but are kept for clarity.
    loader: "custom",
    loaderFile: "./lib/shopify-image-loader.ts",
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
    // Allow all local images, including those with a cache-busting `?v=` query
    // (Next 15.6 blocks query strings on local images unless allow-listed).
    localPatterns: [{ pathname: "/**", search: "" }, { pathname: "/**" }],
    // Allow Canva-exported franchise SVGs (cut-outs) to be served. Scoped CSP
    // blocks any scripts inside the SVG.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
    ],
  },
};
