import CartModal from "components/cart/modal";
import LogoLockup from "components/logo-lockup";
import { getCollectionProducts, getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import { AccountNav } from "./account-nav";
import { FEATURED_COLLECTION_HANDLES } from "./featured-collections";
import MobileMenu from "./mobile-menu";
import { NavMenu } from "./nav-menu";
import Search, { SearchSkeleton } from "./search";
import { WishlistNavLink } from "./wishlist-nav-link";

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

  // Resolve a representative photo for each mega-menu featured collection.
  const featuredEntries = await Promise.all(
    FEATURED_COLLECTION_HANDLES.map(async (handle) => {
      const products = await getCollectionProducts({ collection: handle });
      const urls = products
        .map((p) => p.featuredImage?.url)
        .filter((u): u is string => Boolean(u))
        .slice(0, 4);
      return [handle, urls] as const;
    }),
  );
  const featuredImages = Object.fromEntries(featuredEntries);

  const links: Menu[] = menu.length
    ? menu
    : [
        { title: "Figures", path: "/search" },
        { title: "Funko", path: "/search" },
        { title: "Blind Box", path: "/search" },
        { title: "Trading Cards", path: "/search" },
        { title: "Novelty", path: "/search" },
        { title: "Toys", path: "/search" },
        { title: "Retro", path: "/search" },
        { title: "Gaming", path: "/search" },
        { title: "Still Good", path: "/search" },
      ];

  return (
    <div className="relative z-30 w-full border-b-[2.5px] border-anime-ink bg-white">
      <nav className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-4 py-6 lg:gap-4 lg:px-6">
        <Link
          href="/"
          prefetch={true}
          className="flex shrink-0 items-center gap-2"
          aria-label="caseclosed home"
        >
          <div className="flex xl:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={links} />
            </Suspense>
          </div>
          <LogoLockup />
        </Link>

        <NavMenu links={links} featuredImages={featuredImages} />

        <div className="flex flex-1 justify-center">
          <div className="hidden w-full min-w-[140px] max-w-xs md:block">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <AccountNav />
          <WishlistNavLink />
          <CartModal />
        </div>
      </nav>
    </div>
  );
}
