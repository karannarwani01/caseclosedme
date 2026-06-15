"use client";

import clsx from "clsx";
import type { Product } from "lib/shopify/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  toWishlistItem,
  useWishlist,
  type WishlistItem,
} from "./wishlist-context";

// Clean, symmetric, COMPLETE heart (centered in the 24×24 box).
function HeartGlyph({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full overflow-visible">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? "currentColor" : "white"}
        stroke="var(--color-anime-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* glossy manga shine */}
      <ellipse
        cx="8.5"
        cy="8.2"
        rx="1.9"
        ry="1.25"
        fill="white"
        opacity={filled ? 0.85 : 0.95}
        transform="rotate(-28 8.5 8.2)"
      />
    </svg>
  );
}

// "card" = manga heart sticker on a product card.
// "detail" = full comic button on the product page, next to Add to cart.
export function WishlistButton({
  product,
  variant = "card",
  positionClass = "left-2 top-2",
}: {
  product: Product;
  variant?: "card" | "detail";
  positionClass?: string;
}) {
  const { isInWishlist, toggle, hydrated } = useWishlist();
  const active = hydrated && isInWishlist(product.handle);
  const [pulse, setPulse] = useState(0);
  const [bursting, setBursting] = useState(false);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: WishlistItem = toWishlistItem(product);
    const wasIn = isInWishlist(product.handle);
    toggle(item);
    setPulse((n) => n + 1);
    if (!wasIn) {
      setBursting(true);
      window.setTimeout(() => setBursting(false), 520);
    }
    toast(wasIn ? "💔 Removed from wishlist" : "💖 Added to wishlist!", {
      description: product.title,
    });
  };

  const label = active ? "Remove from wishlist" : "Add to wishlist";

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        className={clsx(
          "relative flex w-full items-center justify-center gap-2 overflow-visible rounded-full border-[3px] border-anime-ink px-7 py-4 font-comic text-xl uppercase tracking-[0.06em] shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:rotate-[-1.5deg] hover:shadow-[8px_8px_0_0_var(--color-anime-pink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0_0_var(--color-anime-ink)]",
          active
            ? "bg-anime-pink text-white"
            : "bg-anime-yellow text-anime-ink",
        )}
      >
        <span
          key={pulse}
          className={clsx(
            "relative h-7 w-7 text-anime-pink",
            pulse > 0 && "animate-pop",
          )}
        >
          <HeartGlyph filled />
          {bursting ? <BurstStars /> : null}
        </span>
        {active ? "Saved!" : "Save it"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={clsx(
        "absolute z-20 grid h-10 w-10 -rotate-6 place-items-center rounded-full border-[3px] border-anime-ink shadow-[2.5px_2.5px_0_0_var(--color-anime-ink)] transition-all duration-150 hover:rotate-0 hover:-translate-y-0.5 hover:scale-110 hover:shadow-[4px_4px_0_0_var(--color-anime-ink)] active:translate-y-0 active:scale-95",
        positionClass,
        active ? "bg-anime-pink" : "bg-anime-yellow hover:bg-anime-cyan",
      )}
    >
      {/* burst ring on add */}
      {bursting ? (
        <span
          aria-hidden
          className="animate-burst-ping pointer-events-none absolute -inset-1 rounded-full border-[3px] border-anime-pink"
        />
      ) : null}
      <span
        key={pulse}
        className={clsx(
          "relative h-[22px] w-[22px]",
          active ? "text-white" : "text-anime-pink",
          pulse > 0 && "animate-pop",
          active && pulse === 0 && "animate-heart-beat",
        )}
      >
        <HeartGlyph filled={active} />
      </span>
      {bursting ? <BurstStars /> : null}
    </button>
  );
}

// Little manga sparkle stars that fling outward when something is added.
function BurstStars() {
  const stars = [
    { x: "-150%", y: "-130%", d: "0ms", c: "var(--color-anime-yellow)" },
    { x: "160%", y: "-120%", d: "40ms", c: "var(--color-anime-cyan)" },
    { x: "-130%", y: "140%", d: "80ms", c: "var(--color-anime-lime)" },
    { x: "150%", y: "150%", d: "20ms", c: "var(--color-anime-purple)" },
  ];
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className="animate-pop absolute left-1/2 top-1/2 h-2.5 w-2.5"
          style={{
            transform: `translate(${s.x}, ${s.y})`,
            animationDelay: s.d,
            color: s.c,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-full w-full"
          >
            <path
              d="M12 0l2.9 8.1L23 8.6l-6.5 5.2L19 22l-7-4.7L5 22l2.5-8.2L1 8.6l8.1-.5z"
              stroke="var(--color-anime-ink)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ))}
    </span>
  );
}
