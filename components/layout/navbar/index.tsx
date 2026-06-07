import { HeartIcon, UserIcon } from "@heroicons/react/24/outline";
import CartModal from "components/cart/modal";
import LogoLockup from "components/logo-lockup";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import { NavMenu } from "./nav-menu";
import Search, { SearchSkeleton } from "./search";

// Shopify-hosted new customer accounts (login / order history / account).
const ACCOUNT_URL = "https://shopify.com/71115997383/account";

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

        <NavMenu links={links} />

        <div className="flex flex-1 justify-center">
          <div className="hidden w-full min-w-[140px] max-w-xs md:block">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={ACCOUNT_URL}
            aria-label="Log in to your account"
            className="grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-anime-cyan text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] lg:h-12 lg:w-12"
          >
            <UserIcon className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-anime-lime text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] lg:h-12 lg:w-12"
          >
            <HeartIcon className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <CartModal />
        </div>
      </nav>
    </div>
  );
}
