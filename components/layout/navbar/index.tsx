import CartModal from "components/cart/modal";
import OpenCart from "components/cart/open-cart";
import LogoLockup from "components/logo-lockup";
import {
  getCollectionFeaturedImageUrls,
  getMenu,
  getNonEmptyCollectionHandles,
} from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import { AccountNav } from "./account-nav";
import { FEATURED_COLLECTION_HANDLES } from "./featured-collections";
import { megaHasContent } from "./mega-config";
import MobileMenu from "./mobile-menu";
import { NavMenu } from "./nav-menu";
import Search, { SearchSkeleton } from "./search";
import { WishlistNavLink } from "./wishlist-nav-link";

export async function Navbar() {
  const [menu, nonEmpty] = await Promise.all([
    getMenu("next-js-frontend-header-menu"),
    getNonEmptyCollectionHandles(),
  ]);

  // Resolve a representative photo for each mega-menu featured collection.
  // Uses a minimal featured-image-only query (not the full product listing).
  const featuredEntries = await Promise.all(
    FEATURED_COLLECTION_HANDLES.map(async (handle) => {
      const urls = await getCollectionFeaturedImageUrls(handle);
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
        { title: "Cars", path: "/search" },
        { title: "Retro", path: "/search" },
        { title: "Gaming", path: "/search" },
        { title: "Still Good", path: "/search" },
      ];

  // "Protectors" is a code-managed top-level (Funko / TCG / Hot Wheels protector
  // collections). Append it when the Shopify-managed menu doesn't already list
  // it, so it shows alongside the other categories.
  const linksWithProtectors: Menu[] = links.some(
    (l) => l.title === "Protectors",
  )
    ? links
    : [...links, { title: "Protectors", path: "/search/protectors" }];

  // Hide whole top-level menus whose collections are all empty (mobile mirrors
  // the desktop NavMenu, which filters itself).
  const nonEmptySet = new Set(nonEmpty);
  const visibleLinks = linksWithProtectors.filter((l) =>
    megaHasContent(l.title, nonEmptySet),
  );

  return (
    <div className="sticky top-0 z-50 w-full border-b-[2.5px] border-anime-ink bg-white">
      <nav className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-4 py-6 lg:gap-4 lg:px-6">
        {/* Mobile hamburger stays pinned left; hidden on desktop. */}
        <div className="flex shrink-0 xl:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={visibleLinks} nonEmpty={nonEmpty} />
          </Suspense>
        </div>

        {/* Logo + nav links + search, centered in the row. */}
        <div className="flex flex-1 items-center justify-center gap-3 lg:gap-6">
          <Link
            href="/"
            prefetch={true}
            className="flex shrink-0 items-center"
            aria-label="caseclosed home"
          >
            <LogoLockup />
          </Link>
          <NavMenu
            links={visibleLinks}
            featuredImages={featuredImages}
            nonEmpty={nonEmpty}
          />
          <div className="hidden w-full min-w-[140px] max-w-xs md:block">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          {/* Account / wishlist / cart — desktop only. On mobile these live in
              the bottom tab bar, so they're hidden here to keep the header clean.
              (CartModal stays mounted so the bottom bar's cart button can still
              open the drawer via the `open-cart` event.) */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <AccountNav />
            <WishlistNavLink />
            {/* CartModal reads the private, cookie-backed cart, which can't be
                prerendered — unwrapped it forced every route dynamic. The
                fallback is the same trigger minus the quantity badge, so the
                header looks identical until the count streams in. */}
            <Suspense
              fallback={
                <button aria-label="Open cart">
                  <OpenCart />
                </button>
              }
            >
              <CartModal />
            </Suspense>
          </div>
        </div>

        {/* Mobile-only spacer matching the hamburger, so the centered logo is
            balanced across the row (not pushed right by the menu button). */}
        <div className="w-11 shrink-0 xl:hidden" aria-hidden />
      </nav>
    </div>
  );
}
