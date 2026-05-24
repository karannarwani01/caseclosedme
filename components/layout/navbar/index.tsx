import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import { NavMenu } from "./nav-menu";
import Search, { SearchSkeleton } from "./search";

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

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
      <nav className="mx-auto flex w-full max-w-[1800px] items-center gap-6 px-6 py-6 lg:gap-8 lg:px-8">
        <Link
          href="/"
          prefetch={true}
          className="flex flex-1 items-center gap-4"
          aria-label="caseclosed home"
        >
          <div className="flex md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={menu} />
            </Suspense>
          </div>
          <LogoSquare />
          <span className="hidden font-display text-[40px] font-extrabold leading-none tracking-[-0.02em] text-anime-ink md:inline">
            caseclosed
          </span>
        </Link>

        <NavMenu links={links} />

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden md:block md:w-64 lg:w-80">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          <CartModal />
        </div>
      </nav>
    </div>
  );
}
