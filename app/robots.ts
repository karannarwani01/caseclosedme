import { baseUrl } from "lib/utils";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        // API endpoints and the login-only account dashboard have no place in
        // a crawl. Everything else stays open.
        disallow: ["/api/", "/account"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
