"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

// Horizontal "More like this" row with comic joystick arrows — visible on
// mobile and desktop, auto-hiding at each end / when everything fits.
export function UpsellCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (el)
      el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow =
    "grid h-11 w-11 place-items-center rounded-full border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:bg-anime-pink hover:text-white active:translate-y-[1px] disabled:opacity-40 disabled:shadow-none disabled:hover:bg-white disabled:hover:text-anime-ink";

  return (
    <div>
      <ul
        ref={ref}
        className="flex snap-x gap-4 overflow-x-auto scroll-smooth px-1 pb-3 lg:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>

      {/* Controls below the row (not overlapping the cards). */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          disabled={!canLeft}
          className={arrow}
        >
          <ArrowLeftIcon className="h-5" strokeWidth={2.75} />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          disabled={!canRight}
          className={arrow}
        >
          <ArrowRightIcon className="h-5" strokeWidth={2.75} />
        </button>
      </div>
    </div>
  );
}
