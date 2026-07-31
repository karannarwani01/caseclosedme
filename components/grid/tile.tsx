"use client";

import { QuickAddButton } from "components/cart/quick-add-button";
import clsx from "clsx";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import { Suspense, useState } from "react";
import Label from "../label";

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  swatch,
  badge,
  zoom = false,
  product,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  swatch?: [string, string];
  badge?: string;
  // When true, the photo magnifies and pans under the cursor on hover.
  zoom?: boolean;
  // When provided, a small quick-add sticker renders in the top-right corner.
  // The wishlist heart owns the top-left, Badge sits under it.
  product?: Product;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>) {
  const hasImage = Boolean(props.src);
  const [hover, setHover] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  return (
    <div
      className={clsx(
        "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-white border-[2.5px] border-anime-ink transition-all duration-150 ease-out",
        "shadow-[5px_5px_0_0_var(--color-anime-ink)]",
        {
          "hover:-translate-x-[3px] hover:-translate-y-[3px] hover:rotate-[-1.5deg] hover:shadow-[9px_9px_0_0_var(--color-anime-pink)]":
            isInteractive && !zoom,
          "shadow-[9px_9px_0_0_var(--color-anime-pink)]": active,
          "cursor-zoom-in": zoom && hasImage,
        },
      )}
      onMouseEnter={zoom ? () => setHover(true) : undefined}
      onMouseLeave={zoom ? () => setHover(false) : undefined}
      onMouseMove={
        zoom
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(
                `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`,
              );
            }
          : undefined
      }
    >
      {/* Anime speed-lines burst behind the figure */}
      <div
        aria-hidden
        className={clsx(
          "absolute inset-[10%] opacity-55 transition-transform duration-500 ease-out",
          { "group-hover:rotate-[40deg]": isInteractive && !zoom },
        )}
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 50% 45%, var(--color-anime-yellow) 0deg 8deg, transparent 8deg 16deg)",
          maskImage:
            "radial-gradient(circle at 50% 45%, black 0 36%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black 0 36%, transparent 70%)",
        }}
      />

      {hasImage ? (
        <Image
          className={clsx(
            "relative z-10 h-full w-full object-contain px-5 pt-5",
            {
              // Leave room at the bottom so the label overlay never crops the figure.
              "pb-[5.25rem]": label,
              "pb-5": !label,
              "transition-transform duration-500 ease-out group-hover:scale-[1.08] group-hover:rotate-[6deg]":
                isInteractive && !zoom,
              "transition-transform duration-200 ease-out": zoom,
            },
          )}
          style={
            zoom
              ? {
                  transform: hover ? "scale(1.9)" : "scale(1)",
                  transformOrigin: origin,
                }
              : undefined
          }
          {...props}
        />
      ) : swatch ? (
        <CircleFigure swatch={swatch} isInteractive={isInteractive} />
      ) : null}

      {badge ? <Badge text={badge} /> : null}

      {/* QuickAddButton reads the cookie-backed cart via useCart(), which
          suspends — without this boundary every tile carrying it would punch a
          hole in the homepage's prerendered shell (the ◐ that took mobile LCP
          from 6.2s to 5.0s). The sticker streams in; the card never waits. */}
      {product ? (
        <Suspense fallback={null}>
          <QuickAddButton
            product={product}
            variant="icon"
            positionClass="right-2 top-2"
          />
        </Suspense>
      ) : null}

      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}

function CircleFigure({
  swatch,
  isInteractive,
}: {
  swatch: [string, string];
  isInteractive: boolean;
}) {
  const [a, b] = swatch;
  return (
    <div className="relative z-10 flex h-full w-full items-center justify-center px-6 pb-16 pt-7 box-border">
      <div
        className={clsx(
          "aspect-square w-[70%] rounded-full border-[2.5px] border-anime-ink transition-transform duration-500 ease-out",
          {
            "group-hover:scale-[1.08] group-hover:rotate-[6deg]": isInteractive,
          },
        )}
        style={{
          background: `
            radial-gradient(circle at 50% 35%, ${a} 0 28%, transparent 28%),
            radial-gradient(circle at 50% 60%, ${b} 0 32%, transparent 32%),
            white
          `,
          filter: "drop-shadow(4px 4px 0 var(--color-anime-ink))",
        }}
      />
    </div>
  );
}

function Badge({ text }: { text: string }) {
  const isDiscount = text.startsWith("−") || text.startsWith("-");
  const isNew = text.toLowerCase().includes("new");
  const isPreOrder = text.toLowerCase().includes("pre");

  let palette = "bg-anime-yellow text-anime-ink"; /* default: NEW yellow */
  let rotate = "rotate-[-3deg]";

  if (isDiscount) {
    palette = "bg-anime-pink text-white";
    rotate = "rotate-[2deg]";
  } else if (isPreOrder) {
    palette = "bg-white text-anime-ink";
    rotate = "rotate-[-4deg]";
  } else if (isNew) {
    palette = "bg-anime-yellow text-anime-ink";
    rotate = "rotate-[-3deg]";
  } else {
    palette = "bg-anime-cyan text-anime-ink";
    rotate = "rotate-[-2deg]";
  }

  return (
    <div
      className={clsx(
        "absolute left-3 top-3 z-20 border-[2.5px] border-anime-ink rounded-full px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-[0.08em]",
        palette,
        rotate,
      )}
      style={{ boxShadow: "3px 3px 0 0 var(--color-anime-ink)" }}
    >
      {text}
    </div>
  );
}
