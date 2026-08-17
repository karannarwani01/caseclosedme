import { getAllProductHandles, getCollections, getPages } from "lib/shopify";
import { baseUrl, validateEnvironmentVariables } from "lib/utils";
import { MetadataRoute } from "next";

type Route = {
  url: string;
  lastModified?: string;
};

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  validateEnvironmentVariables();

  // Static storefront routes. /account and /wishlist are personal (noindex)
  // and /drop-alerts is a redirect to /membership, so none of those belong
  // here.
  // No lastModified on static routes: stamping "now" on every crawl teaches
  // Google to ignore our lastmod values. /search is emitted via collections.
  const routesMap = [
    "",
    "/reviews",
    "/membership",
    "/refund-request",
    "/contact",
    "/shop-now-pay-later",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
  }));

  const collectionsPromise = getCollections().then((collections) =>
    collections.map((collection) => ({
      url: `${baseUrl}${collection.path}`,
      lastModified: collection.updatedAt,
    })),
  );

  const productsPromise = getAllProductHandles().then((products) =>
    products.map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: product.updatedAt,
    })),
  );

  const pagesPromise = getPages().then((pages) =>
    pages.map((page) => ({
      url: `${baseUrl}/${page.handle}`,
      lastModified: page.updatedAt,
    })),
  );

  let fetchedRoutes: Route[] = [];

  try {
    fetchedRoutes = (
      await Promise.all([collectionsPromise, productsPromise, pagesPromise])
    ).flat();
  } catch (error) {
    // Rethrow the original error — stringifying it threw a bare string,
    // losing the stack and breaking instanceof Error handling upstream.
    throw error;
  }

  return [...routesMap, ...fetchedRoutes];
}
