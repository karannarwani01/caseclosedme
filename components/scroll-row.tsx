"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

// Horizontal scroller with comic "joystick" arrows. Arrows auto-show only when
// there's somewhere to scroll (so they vanish on desktop where everything
// fits), and disable at each end. The scrollable element's layout classes come
// in via `className`; `arrowClassName` tunes the arrows' vertical position.
export function ScrollRow({
  children,
  className,
  arrowClassName,
}: {
  children: React.ReactNode;
  className?: string;
  arrowClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrow =
    "absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-anime-ink bg-white text-anime-ink shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all hover:bg-anime-pink hover:text-white disabled:pointer-events-none disabled:opacity-0";

  return (
    <div className="relative">
      <div
        ref={ref}
        className={clsx(
          "overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        disabled={!canLeft}
        className={clsx(arrow, "left-1", arrowClassName)}
      >
        <ArrowLeftIcon className="h-5 w-5" strokeWidth={2.75} />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        disabled={!canRight}
        className={clsx(arrow, "right-1", arrowClassName)}
      >
        <ArrowRightIcon className="h-5 w-5" strokeWidth={2.75} />
      </button>
    </div>
  );
}
