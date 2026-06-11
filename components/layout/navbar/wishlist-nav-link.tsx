"use client";

import { HeartIcon } from "@heroicons/react/24/outline";
import { useWishlist } from "components/wishlist/wishlist-context";
import Link from "next/link";

export function WishlistNavLink() {
  const { count, hydrated } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist${hydrated && count > 0 ? ` (${count} saved)` : ""}`}
      className="relative grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-anime-ink bg-anime-lime text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] lg:h-12 lg:w-12"
    >
      <HeartIcon className="h-5 w-5" strokeWidth={2.5} />
      {hydrated && count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-anime-ink bg-anime-pink px-1 font-display text-[10px] font-extrabold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
