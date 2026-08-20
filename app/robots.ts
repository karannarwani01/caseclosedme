import { baseUrl } from "lib/utils";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        // API endpoints and the login-only account dashboard have no place in
        // a crawl, and neither do per-visitor pages (cart, wishlist) or the
        // infinite space of query'd search URLs — every crawl of those is a
        // dynamic render that burns Vercel CPU/origin-transfer quota. The
        // canonical /search page and /search/[collection] pages stay open.
        disallow: [
          "/api/",
          "/account",
          "/cart",
          "/wishlist",
          "/*?q=",
          "/*?sort=",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
