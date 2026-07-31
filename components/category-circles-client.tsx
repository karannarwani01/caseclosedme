"use client";

import { ScrollRow } from "components/scroll-row";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type CategoryItem = {
  slug: string;
  name: string;
  color: string;
  glyph: string;
  hoverFit?: "contain" | "cover";
  flatBg?: boolean;
  bg?: string;
  hoverPosition?: string;
  logo?: string;
  logoHover?: string;
};

const SIZES =
  "(max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1280px) 176px, 192px";

// Desktop plays the animation on hover. Touch devices have no hover, so we
// autoplay — but only ONE at a time (the circle most in view), swapping the
// rest back to their static poster so just a single animated WebP decodes.
export function CategoryCirclesClient({ items }: { items: CategoryItem[] }) {
  // Touch-first default: SSR HTML must NOT include hover-animation WebPs
  // (420KB+) — phones would download them before hydration can gate them.
  // Desktops flip to hover-mode post-hydration, long before any mouse arrives.
  const [isTouch, setIsTouch] = useState(true);
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const touch = window.matchMedia("(hover: none)").matches;
    setIsTouch(touch);
    if (!touch) return;

    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.idx);
          ratios.set(i, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best = 0;
        let bestR = -1;
        ratios.forEach((r, i) => {
          if (r > bestR) {
            bestR = r;
            best = i;
          }
        });
        setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ScrollRow
      className="flex gap-6 pb-6 md:justify-between md:gap-4 md:overflow-visible"
      arrowClassName="top-[3.5rem] md:hidden"
    >
      {items.map((cat, i) => {
        const { logo, logoHover } = cat;
        const touchActive = isTouch && i === active;
        // Mount the animated image only where it's actually shown: desktop
        // (hover-ready) or the single active touch circle. Inactive touch
        // circles render just the static poster, so only one WebP decodes.
        const showAnimated = !isTouch || touchActive;

        return (
          <Link
            prefetch={false}
            key={cat.slug}
            href={`/search/${cat.slug}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-idx={i}
            className="group flex flex-none flex-col items-center gap-4 md:flex-1 md:min-w-0"
          >
            <div
              className="relative h-28 w-28 overflow-hidden rounded-full border-[2.5px] border-anime-ink shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-transform duration-150 ease-out group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] md:h-36 md:w-36 lg:h-44 lg:w-44 xl:h-48 xl:w-48"
              style={{
                background: cat.bg
                  ? cat.bg
                  : cat.flatBg
                    ? cat.color
                    : `radial-gradient(circle at 50% 28%, color-mix(in srgb, ${cat.color} 50%, #fff) 0%, ${cat.color} 72%)`,
              }}
            >
              {logo ? (
                <>
                  {/* Static poster. On desktop it fades out on hover; on touch
                      it stays under the animation (no blank flash while the
                      active WebP loads). */}
                  <Image
                    src={logo}
                    alt={`${cat.name} — collectibles`}
                    fill
                    sizes={SIZES}
                    unoptimized={/\.gif(\?|$)/i.test(logo)}
                    className={`object-contain transition-opacity duration-300 ease-out ${
                      isTouch ? "opacity-100" : "group-hover:opacity-0"
                    }`}
                  />
                  {/* Animated image — mounted only when it should play. */}
                  {showAnimated ? (
                    <Image
                      src={logoHover ?? logo}
                      alt=""
                      aria-hidden
                      fill
                      sizes={SIZES}
                      unoptimized
                      style={
                        cat.hoverPosition
                          ? { objectPosition: cat.hoverPosition }
                          : undefined
                      }
                      className={`transition-opacity duration-300 ease-out ${
                        cat.hoverFit === "cover"
                          ? "object-cover"
                          : "object-contain"
                      } ${isTouch ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out group-hover:opacity-0">
                    <span className="font-display text-5xl font-extrabold text-white drop-shadow-[3px_3px_0_rgba(13,10,26,0.6)] md:text-6xl lg:text-7xl xl:text-8xl">
                      {cat.glyph}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-anime-ink px-3 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
                    <span className="text-center font-display text-base font-extrabold uppercase leading-tight tracking-[0.04em] text-white md:text-xl lg:text-2xl">
                      {cat.name}
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="text-center font-display text-sm font-extrabold uppercase tracking-[0.06em] text-anime-ink md:text-base">
              {cat.name}
            </p>
          </Link>
        );
      })}
    </ScrollRow>
  );
}
