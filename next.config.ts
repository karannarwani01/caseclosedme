export default {
  // Allow viewing the dev server from phones/other devices on the LAN without
  // the cross-origin /_next/* dev warning. Dev-only; ignored in production.
  allowedDevOrigins: ["192.168.0.139", "localhost"],
  experimental: {
    ppr: true,
    // NOTE: `inlineCss` is intentionally disabled. When enabled, Next inlines the
    // next/font `@font-face` rules into each page's HTML, where their relative
    // `src: url(../media/…)` resolves against the page URL (e.g. /terms-conditions
    // -> /media/… = 404) instead of /_next/static/media/…. That makes every
    // webfont fail to load and the whole site falls back to system fonts.
    useCache: true,
  },
  images: {
    // Next/image optimizer ON in dev + prod (resizes + AVIF/WebP), so images
    // download at display size instead of full-resolution Shopify originals.
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
