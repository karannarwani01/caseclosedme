"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Price from "components/price";
import { SoldOutStamp } from "components/sold-out-stamp";
import { useWishlist } from "components/wishlist/wishlist-context";
import Image from "next/image";
import Link from "next/link";

// Manga sticker accents cycled across the card grid.
const SHADOW = [
  "var(--color-anime-pink)",
  "var(--color-anime-cyan)",
  "var(--color-anime-lime)",
  "var(--color-anime-purple)",
  "var(--color-anime-orange)",
];
const TILT = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];
const BURST = [
  "var(--color-anime-yellow)",
  "var(--color-anime-pink)",
  "var(--color-anime-cyan)",
  "var(--color-anime-lime)",
];

export default function WishlistPage() {
  const { items, hydrated, remove, clear, count } = useWishlist();

  return (
    <div className="relative mx-auto w-full max-w-[1800px] overflow-hidden px-4 py-10 lg:px-6">
      <WishlistHeader count={hydrated ? count : 0} onClear={clear} />

      {!hydrated ? (
        <LoadingState />
      ) : count === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 pt-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item, i) => {
            const shadow = SHADOW[i % SHADOW.length];
            const burst = BURST[i % BURST.length];
            const soldOut = !item.availableForSale;
            return (
              <li
                key={item.handle}
                className="animate-sticker-in group relative flex flex-col"
                style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
              >
                <Link
                  href={`/product/${item.handle}`}
                  prefetch={true}
                  className={`relative block aspect-square overflow-hidden rounded-2xl border-[3px] border-anime-ink bg-white transition-all duration-200 ease-out ${TILT[i % TILT.length]} group-hover:rotate-0 group-hover:-translate-y-1.5`}
                  style={{ boxShadow: `6px 6px 0 0 ${shadow}` }}
                >
                  {/* speed-line burst behind the figure */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-[8%] opacity-30 transition-transform duration-700 ease-out group-hover:rotate-45"
                    style={{
                      background: `repeating-conic-gradient(from 0deg at 50% 46%, ${burst} 0deg 7deg, transparent 7deg 14deg)`,
                      WebkitMaskImage:
                        "radial-gradient(circle at 50% 46%, black 0 38%, transparent 70%)",
                      maskImage:
                        "radial-gradient(circle at 50% 46%, black 0 38%, transparent 70%)",
                    }}
                  />
                  {item.image?.url ? (
                    <Image
                      src={item.image.url}
                      alt={item.image.altText || item.title}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className={
                        "relative z-10 object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.07] group-hover:rotate-[3deg]" +
                        (soldOut ? " opacity-60 saturate-50" : "")
                      }
                    />
                  ) : (
                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                      <span className="font-comic text-6xl text-anime-ink/85">
                        {item.title
                          .replace(/[^a-zA-Z0-9]/g, "")
                          .charAt(0)
                          .toUpperCase() || "?"}
                      </span>
                    </div>
                  )}

                  {/* manga screentone corner */}
                  <span
                    aria-hidden
                    className="cc-halftone pointer-events-none absolute -bottom-2 -right-2 z-10 h-16 w-16 rotate-12 opacity-[0.12]"
                  />

                  {/* holographic foil shine sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20 -translate-x-[120%] skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
                  />

                  {soldOut ? (
                    <>
                      <SoldOutStamp className="w-[78%]" />
                      <span className="sr-only">Sold out</span>
                    </>
                  ) : null}
                </Link>

                {/* comic "remove" stamp */}
                <button
                  type="button"
                  onClick={() => remove(item.handle)}
                  aria-label={`Remove ${item.title} from wishlist`}
                  className="absolute -right-2 -top-2 z-30 grid h-9 w-9 -rotate-6 place-items-center rounded-full border-[3px] border-anime-ink bg-white text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] transition-all hover:rotate-0 hover:scale-110 hover:bg-anime-pink hover:text-white active:scale-95"
                >
                  <XMarkIcon className="h-4 w-4" strokeWidth={3.5} />
                </button>

                <div className="px-1 pt-3">
                  <h3 className="line-clamp-2 min-h-[2.4em] font-display text-[13px] font-extrabold uppercase leading-tight tracking-[0.03em] text-anime-ink">
                    {item.title}
                  </h3>
                  <span className="mt-1.5 inline-block -rotate-1 rounded-md border-[2.5px] border-anime-ink bg-anime-lime px-2 py-0.5 shadow-[2px_2px_0_0_var(--color-anime-ink)]">
                    <Price
                      className="font-comic text-base tracking-wide text-anime-ink"
                      amount={item.price.amount}
                      currencyCode={item.price.currencyCode}
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function WishlistHeader({
  count,
  onClear,
}: {
  count: number;
  onClear: () => void;
}) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border-[3px] border-anime-ink bg-white shadow-[8px_8px_0_0_var(--color-anime-ink)]">
      {/* speed-line burst + halftone behind the title */}
      <div
        aria-hidden
        className="cc-speedlines animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
      />
      <div
        aria-hidden
        className="cc-halftone pointer-events-none absolute inset-0 opacity-[0.05]"
      />

      {/* twinkling kirakira sparkles */}
      <Sparkle className="left-[8%] top-[22%] h-6 w-6 text-anime-cyan" />
      <Sparkle
        className="left-[16%] bottom-[20%] h-4 w-4 text-anime-pink"
        delay="0.6s"
      />
      <Sparkle
        className="right-[10%] top-[28%] h-7 w-7 text-anime-yellow"
        delay="0.3s"
      />
      <Sparkle
        className="right-[18%] bottom-[24%] h-5 w-5 text-anime-purple"
        delay="0.9s"
      />
      <Sparkle
        className="left-[46%] top-[10%] h-4 w-4 text-anime-lime"
        delay="1.2s"
      />

      <div className="relative flex flex-col items-center gap-5 px-6 py-12 text-center md:py-16">
        <span className="-rotate-2 rounded-full border-[3px] border-anime-ink bg-anime-cyan px-4 py-1 font-comic text-sm uppercase tracking-[0.14em] text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)]">
          ★ お気に入り ・ My Faves ★
        </span>

        <h1 className="cc-comic-outline font-comic text-6xl uppercase leading-[0.9] text-anime-pink sm:text-7xl md:text-8xl">
          Wishlist
        </h1>

        <CountBadge count={count} />

        {count > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="mt-1 rotate-1 rounded-full border-[3px] border-anime-ink bg-anime-yellow px-5 py-2 font-comic text-sm uppercase tracking-wider text-anime-ink shadow-[4px_4px_0_0_var(--color-anime-ink)] transition-all hover:-translate-y-0.5 hover:rotate-0 hover:shadow-[6px_6px_0_0_var(--color-anime-ink)] active:translate-y-0"
          >
            ✕ Clear them all
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <div className="relative grid h-20 w-20 place-items-center">
      <svg
        viewBox="0 0 64 64"
        className="animate-spin-slow absolute inset-0 h-full w-full"
        style={{ filter: "drop-shadow(3px 3px 0 var(--color-anime-ink))" }}
        aria-hidden
      >
        <path
          d="M32 2 L38 14 L51 9 L48 23 L62 26 L52 35 L62 44 L48 46 L51 60 L38 53 L32 64 L26 53 L13 60 L16 46 L2 44 L12 35 L2 26 L16 23 L13 9 L26 14 Z"
          fill="var(--color-anime-pink)"
          stroke="var(--color-anime-ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative z-10 text-center leading-none text-white">
        <div className="font-comic text-2xl">{count}</div>
        <div className="font-display text-[8px] font-extrabold uppercase tracking-wider">
          Saved
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <span className="animate-heart-beat grid h-16 w-16 place-items-center rounded-full border-[3px] border-anime-ink bg-anime-pink text-white shadow-[4px_4px_0_0_var(--color-anime-ink)]">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
          <path d="M12 21s-7.5-4.6-10-9.2C.7 9 1.8 5.5 5 5c2-.3 3.4 1 4 2 .6-1 2-2.3 4-2 3.2.5 4.3 4 3 6.8C19.5 16.4 12 21 12 21z" />
        </svg>
      </span>
      <p className="font-comic text-lg uppercase tracking-wide text-anime-ink/60">
        Loading your loot…
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center justify-center gap-7 overflow-hidden rounded-3xl border-[3px] border-dashed border-anime-ink/40 px-6 py-20 text-center">
      <div
        aria-hidden
        className="cc-rays animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]"
      />

      {/* twinkling sparkles around the medallion */}
      <Sparkle className="left-1/2 top-[18%] h-6 w-6 -translate-x-[80px] text-anime-pink" />
      <Sparkle
        className="left-1/2 top-[16%] h-5 w-5 translate-x-[70px] text-anime-cyan"
        delay="0.5s"
      />
      <Sparkle
        className="left-1/2 top-[34%] h-4 w-4 translate-x-[95px] text-anime-yellow"
        delay="1s"
      />

      <span className="animate-float-y relative grid h-28 w-28 -rotate-6 place-items-center rounded-full border-[3px] border-anime-ink bg-anime-lime shadow-[6px_6px_0_0_var(--color-anime-ink)]">
        {/* clean whole heart sticker (matches the product-card hearts) */}
        <svg viewBox="0 0 24 24" className="h-14 w-14">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="white"
            stroke="var(--color-anime-ink)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <ellipse
            cx="8.5"
            cy="8.2"
            rx="1.9"
            ry="1.25"
            fill="var(--color-anime-pink)"
            transform="rotate(-28 8.5 8.2)"
          />
        </svg>
      </span>

      <div className="relative">
        <h2 className="font-comic text-4xl uppercase tracking-tight text-anime-ink md:text-5xl">
          Nothing saved yet!
        </h2>
        <p className="mx-auto mt-3 max-w-sm font-sans text-sm text-anime-ink/55">
          Tap the heart on any figure, blind box, or card to stash it here. Your
          wishlist is saved right on this device.
        </p>
      </div>

      <Link
        href="/search"
        className="relative -rotate-1 rounded-full border-[3px] border-anime-ink bg-anime-pink px-8 py-3.5 font-comic text-xl uppercase tracking-wider text-white shadow-[6px_6px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:rotate-0 hover:shadow-[9px_9px_0_0_var(--color-anime-ink)] active:translate-x-0 active:translate-y-0"
      >
        Start collecting →
      </Link>
    </div>
  );
}

// Twinkling 4-point manga sparkle. Position/size/color via className.
function Sparkle({
  className,
  delay = "0s",
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <span
      aria-hidden
      className={`animate-twinkle pointer-events-none absolute z-10 ${className ?? ""}`}
      style={{ animationDelay: delay }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path
          d="M12 0c.7 6.4 5 10.6 12 12-7 1.4-11.3 5.6-12 12-.7-6.4-5-10.6-12-12C7 10.6 11.3 6.4 12 0z"
          stroke="var(--color-anime-ink)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
