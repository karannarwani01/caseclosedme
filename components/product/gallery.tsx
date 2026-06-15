"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export function Gallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageIndex = searchParams.has("image")
    ? parseInt(searchParams.get("image")!)
    : 0;

  // Zoom preview: hover-magnify on desktop, tap-to-zoom on touch.
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const clickGuard = useRef(false);
  const moveOrigin = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOrigin({
      x: ((clientX - r.left) / r.width) * 100,
      y: ((clientY - r.top) / r.height) * 100,
    });
  };

  const updateImage = (index: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", index);
    router.replace(`?${params.toString()}`, { scroll: false });
    setZoom(false);
  };

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex =
    imageIndex === 0 ? images.length - 1 : imageIndex - 1;

  // Swipe support: drag left → next image, drag right → previous.
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };
  // While zoomed, dragging pans the magnified view instead of swiping images.
  const onTouchMove = (e: React.TouchEvent) => {
    if (!zoom) return;
    const t = e.touches[0];
    if (t) moveOrigin(t.clientX, t.clientY, e.currentTarget as HTMLElement);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (zoom || touchStartX.current === null) {
      touchStartX.current = null;
      return;
    }
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 40) {
      updateImage((dx < 0 ? nextImageIndex : previousImageIndex).toString());
      clickGuard.current = true; // swallow the click a swipe synthesizes
    }
    touchStartX.current = null;
  };

  const arrowClassName =
    "absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-[2.5px] border-anime-ink bg-white/90 text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] backdrop-blur-sm transition-all hover:bg-anime-pink hover:text-white md:h-12 md:w-12";

  return (
    <form className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start">
      {images.length > 1 ? (
        <ul className="flex shrink-0 gap-3 overflow-x-auto py-1 lg:flex-col lg:overflow-visible">
          {images.map((image, index) => {
            const isActive = index === imageIndex;
            return (
              <li key={image.src} className="shrink-0">
                <button
                  formAction={() => updateImage(index.toString())}
                  aria-label="Select product image"
                  className={clsx(
                    "block h-[68px] w-[68px] overflow-hidden rounded-xl border-[2.5px] bg-white transition-all",
                    isActive
                      ? "border-anime-pink shadow-[3px_3px_0_0_var(--color-anime-pink)]"
                      : "border-anime-ink hover:-translate-y-0.5 hover:border-anime-pink",
                  )}
                >
                  <Image
                    alt={image.altText}
                    src={image.src}
                    width={68}
                    height={68}
                    className="h-full w-full object-contain p-1.5"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="flex-1">
        <div
          className={clsx(
            "relative aspect-square h-full max-h-[550px] w-full overflow-hidden rounded-xl border-[2.5px] border-anime-ink bg-white",
            zoom ? "cursor-move" : hovering ? "cursor-none" : "cursor-default",
          )}
          onMouseEnter={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
            setHovering(true);
          }}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
            if (zoom) moveOrigin(e.clientX, e.clientY, e.currentTarget);
          }}
          onClick={() => {
            if (clickGuard.current) {
              clickGuard.current = false;
              return;
            }
            setZoom((z) => !z);
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {images[imageIndex] && (
            <Image
              className="h-full w-full object-contain"
              style={{
                transform: zoom ? "scale(2.3)" : "scale(1)",
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              alt={images[imageIndex]?.altText as string}
              src={images[imageIndex]?.src as string}
              priority={true}
            />
          )}

          {/* Magnifying glass that follows the cursor on hover (pre-zoom). */}
          {hovering && !zoom ? (
            <span
              aria-hidden
              className="pointer-events-none absolute z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-anime-ink bg-white/85 text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] backdrop-blur-sm"
              style={{ left: cursor.x, top: cursor.y }}
            >
              <MagnifyingGlassPlusIcon className="h-5" strokeWidth={2.5} />
            </span>
          ) : null}

          {images.length > 1 ? (
            <>
              <button
                formAction={() => updateImage(previousImageIndex.toString())}
                onClick={(e) => e.stopPropagation()}
                aria-label="Previous product image"
                className={clsx(arrowClassName, "left-2 md:left-3")}
              >
                <ArrowLeftIcon className="h-5" strokeWidth={2.5} />
              </button>
              <button
                formAction={() => updateImage(nextImageIndex.toString())}
                onClick={(e) => e.stopPropagation()}
                aria-label="Next product image"
                className={clsx(arrowClassName, "right-2 md:right-3")}
              >
                <ArrowRightIcon className="h-5" strokeWidth={2.5} />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </form>
  );
}
