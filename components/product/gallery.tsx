"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CubeIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { ModelViewer360 } from "components/product/model-viewer-360";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Gallery({
  images,
  model3dUrl,
}: {
  images: { src: string; altText: string }[];
  model3dUrl?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The 3D view, when available, lives at one index past the last image.
  const slideCount = images.length + (model3dUrl ? 1 : 0);
  const imageIndex = searchParams.has("image")
    ? Math.min(parseInt(searchParams.get("image")!) || 0, slideCount - 1)
    : 0;
  const is3d = !!model3dUrl && imageIndex === images.length;

  // Tap the photo to open a full-screen enlarged preview (works on touch +
  // desktop, unlike the old cursor-magnifier).
  const [lightbox, setLightbox] = useState(false);
  const clickGuard = useRef(false);

  const updateImage = (index: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", index);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const nextImageIndex = imageIndex + 1 < slideCount ? imageIndex + 1 : 0;
  const previousImageIndex = imageIndex === 0 ? slideCount - 1 : imageIndex - 1;

  // Swipe support: drag left → next image, drag right → previous (and don't
  // trigger the tap-to-enlarge).
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 40) {
      updateImage((dx < 0 ? nextImageIndex : previousImageIndex).toString());
      clickGuard.current = true; // swallow the click a swipe synthesizes
    }
    touchStartX.current = null;
  };

  // Lock body scroll + Escape-to-close while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const arrowClassName =
    "absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-[2.5px] border-anime-ink bg-white/90 text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] backdrop-blur-sm transition-all hover:bg-anime-pink hover:text-white md:h-12 md:w-12";

  const current = images[imageIndex];

  return (
    <>
      <form className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start">
        {slideCount > 1 ? (
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
            {model3dUrl ? (
              <li key="model-3d" className="shrink-0">
                <button
                  formAction={() => updateImage(images.length.toString())}
                  aria-label="View in 360°"
                  className={clsx(
                    "grid h-[68px] w-[68px] place-items-center rounded-xl border-[2.5px] bg-white transition-all",
                    is3d
                      ? "border-anime-pink shadow-[3px_3px_0_0_var(--color-anime-pink)]"
                      : "border-anime-ink hover:-translate-y-0.5 hover:border-anime-pink",
                  )}
                >
                  <span className="flex flex-col items-center gap-0.5 text-anime-ink">
                    <CubeIcon className="h-6 w-6" strokeWidth={2} />
                    <span className="text-[10px] font-bold leading-none">
                      360°
                    </span>
                  </span>
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="flex-1">
          <div
            className={clsx(
              "relative mx-auto aspect-square w-full max-w-[550px] overflow-hidden rounded-xl border-[2.5px] border-anime-ink bg-white",
              !is3d && "cursor-zoom-in",
            )}
            onClick={() => {
              if (is3d) return;
              if (clickGuard.current) {
                clickGuard.current = false;
                return;
              }
              setLightbox(true);
            }}
            onTouchStart={is3d ? undefined : onTouchStart}
            onTouchEnd={is3d ? undefined : onTouchEnd}
          >
            {is3d && model3dUrl ? (
              <ModelViewer360
                src={model3dUrl}
                poster={images[0]?.src}
                alt={`${images[0]?.altText ?? "Product"} 360° view`}
              />
            ) : (
              current && (
                <Image
                  className="h-full w-full object-contain"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  alt={current.altText}
                  src={current.src}
                  priority={true}
                />
              )
            )}

            {/* Tap-to-enlarge hint (images only) */}
            {!is3d ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-2 right-2 z-10 grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-anime-ink bg-white/90 text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] backdrop-blur-sm"
              >
                <MagnifyingGlassPlusIcon className="h-5" strokeWidth={2.5} />
              </span>
            ) : (
              <span className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border-[2.5px] border-anime-ink bg-white/90 px-3 py-1 text-xs font-bold text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] backdrop-blur-sm">
                Drag to spin · pinch to zoom
              </span>
            )}

            {slideCount > 1 ? (
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

      {/* Full-screen enlarged preview */}
      {lightbox && current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close preview"
            className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-10 grid h-11 w-11 place-items-center rounded-full border-[2.5px] border-white bg-white/10 text-white backdrop-blur-sm"
          >
            <XMarkIcon className="h-6 w-6" strokeWidth={2.5} />
          </button>

          <div
            className="relative h-full w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              className="object-contain"
              fill
              sizes="100vw"
              alt={current.altText}
              src={current.src}
            />
          </div>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateImage(
                    (
                      (imageIndex === 0 ? images.length : imageIndex) - 1
                    ).toString(),
                  );
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-white bg-white/10 text-white backdrop-blur-sm"
              >
                <ArrowLeftIcon className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateImage(((imageIndex + 1) % images.length).toString());
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border-[2.5px] border-white bg-white/10 text-white backdrop-blur-sm"
              >
                <ArrowRightIcon className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
