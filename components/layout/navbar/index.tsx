import { UserIcon } from "@heroicons/react/24/outline";
import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import { NavMenu } from "./nav-menu";
import Search, { SearchSkeleton } from "./search";

// Shopify-hosted customer account (login / register / order history).
const ACCOUNT_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN || "rje5fv-8c.myshopify.com"}/account`;

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
          <Link
            href={ACCOUNT_URL}
            aria-label="Log in to your account"
            className="grid h-14 w-14 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-anime-cyan text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--color-anime-ink)]"
          >
            <UserIcon className="h-6 w-6" strokeWidth={2.5} />
          </Link>
          <CartModal />
        </div>
      </nav>
    </div>
  );
}
