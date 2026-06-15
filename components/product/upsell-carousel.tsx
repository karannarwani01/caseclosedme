"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

// Horizontal product row with prev/next controls (comic circular buttons,
// matching the gallery/hero arrows). Cards (server components) come in as
// children.
export function UpsellCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:scale-110 hover:bg-anime-pink hover:text-white md:grid";

  return (
    <div className="relative md:px-14">
      <ul
        ref={ref}
        className="flex snap-x gap-4 overflow-x-auto scroll-smooth px-1 pb-3 lg:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className={`${arrow} left-0`}
      >
        <ArrowLeftIcon className="h-5" strokeWidth={2.75} />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className={`${arrow} right-0`}
      >
        <ArrowRightIcon className="h-5" strokeWidth={2.75} />
      </button>
    </div>
  );
}
