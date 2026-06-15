export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  images: {
    // Dev only: this environment can't reach cdn.shopify.com through the
    // /_next/image optimizer (ECONNRESET), so serve images unoptimized locally.
    // In production we keep the optimizer ON (AVIF/WebP + resizing) for speed.
    unoptimized: process.env.NODE_ENV === "development",
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
