"use client";

import {
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "components/cart/cart-context";
import { useWishlist } from "components/wishlist/wishlist-context";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Mobile-only thumb navigation, pinned to the bottom of the viewport. The five
// things shoppers reach for most — Home, Search, Cart, Wishlist, Account — one
// tap away. Hidden on desktop (lg+), where the top navbar takes over.
//
// Cart opens the existing cart drawer via an `open-cart` window event (the
// drawer lives once in the navbar), so we don't render a second cart instance.

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-anime-pink px-1 font-display text-[9px] font-extrabold leading-none text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { count: wishCount, hydrated, account } = useWishlist();
  const cartCount = cart?.totalQuantity ?? 0;

  const homeActive = pathname === "/";
  const searchActive = pathname.startsWith("/search");
  const wishActive = pathname.startsWith("/wishlist");

  const cls = (active: boolean) =>
    clsx(
      "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 font-display text-[10px] font-extrabold uppercase tracking-wide transition-colors",
      active ? "text-anime-pink" : "text-anime-ink/70 hover:text-anime-ink",
    );

  const Indicator = ({ active }: { active: boolean }) =>
    active ? (
      <span
        aria-hidden
        className="absolute inset-x-4 top-0 h-1 rounded-full bg-anime-pink"
      />
    ) : null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 flex border-t-[2.5px] border-anime-ink bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-3px_12px_rgba(0,0,0,0.08)] lg:hidden"
    >
      <Link
        href="/"
        className={cls(homeActive)}
        aria-current={homeActive ? "page" : undefined}
      >
        <Indicator active={homeActive} />
        <HomeIcon className="h-6 w-6" strokeWidth={2.2} />
        <span>Home</span>
      </Link>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-search"))}
        className={cls(searchActive)}
        aria-label="Open search"
      >
        <Indicator active={searchActive} />
        <MagnifyingGlassIcon className="h-6 w-6" strokeWidth={2.2} />
        <span>Search</span>
      </button>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-cart"))}
        className={cls(false)}
        aria-label={`Open cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
      >
        <span className="relative">
          <ShoppingBagIcon className="h-6 w-6" strokeWidth={2.2} />
          {cartCount > 0 ? <Badge n={cartCount} /> : null}
        </span>
        <span>Cart</span>
      </button>

      <Link
        href="/wishlist"
        className={cls(wishActive)}
        aria-current={wishActive ? "page" : undefined}
      >
        <Indicator active={wishActive} />
        <span className="relative">
          <HeartIcon className="h-6 w-6" strokeWidth={2.2} />
          {hydrated && wishCount > 0 ? <Badge n={wishCount} /> : null}
        </span>
        <span>Wishlist</span>
      </Link>

      {/* Logged in -> account dashboard; logged out -> /api/auth/login (a route
        handler that 307-redirects to Shopify's external OAuth). Plain <a>, not
        next/link, so the external login redirect is followed by a full nav. */}
      <a
        href={account.loggedIn ? "/account" : "/api/auth/login"}
        className={cls(false)}
        aria-label={account.loggedIn ? "Your account" : "Log in"}
      >
        <span className="relative">
          <UserIcon className="h-6 w-6" strokeWidth={2.2} />
          {account.loggedIn ? (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-anime-lime" />
          ) : null}
        </span>
        <span>Account</span>
      </a>
    </nav>
  );
}
