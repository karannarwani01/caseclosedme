"use client";

import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import { UnitsArrow } from "components/ui/units-arrow";
import { UnitsFill } from "components/ui/units-fill";
import clsx from "clsx";
import type { Product } from "lib/shopify/types";
import { toast } from "sonner";

// Quick add-to-cart for product cards. `pill` = wide bar across the card image
// bottom (feed cards). `icon` = small corner sticker (homepage grid tiles that
// already have a bottom label). Adds the first available variant.
export function QuickAddButton({
  product,
  variant = "pill",
  positionClass = "right-2 top-2",
}: {
  product: Product;
  variant?: "pill" | "icon";
  positionClass?: string;
}) {
  const { addCartItem } = useCart();
  const v =
    product.variants.find((x) => x.availableForSale) ?? product.variants[0];
  const available = product.availableForSale && Boolean(v);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!available || !v) {
      toast("😣 Out of stock");
      return;
    }
    addCartItem(v, product);
    void addItem(null, { selectedVariantId: v.id, quantity: 1 });
    toast("🛒 Added to cart!", { description: product.title });
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!available}
        aria-label={`Add ${product.title} to cart`}
        className={clsx(
          "absolute z-20 grid h-9 w-9 -rotate-6 place-items-center rounded-full border-[3px] border-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)] transition-all duration-150 hover:rotate-0 hover:-translate-y-0.5 hover:scale-110 active:scale-95",
          positionClass,
          available
            ? "bg-anime-cyan text-anime-ink hover:bg-anime-lime"
            : "cursor-not-allowed bg-neutral-200 text-anime-ink/40",
        )}
      >
        <ShoppingBagIcon className="h-[18px] w-[18px]" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!available}
      aria-label={`Add ${product.title} to cart`}
      className={clsx(
        "cc-units cc-u-berry absolute inset-x-2 bottom-2 z-20 flex items-center justify-center gap-1.5 rounded-full border-[2.5px] border-anime-ink py-2 font-comic text-sm uppercase tracking-wide shadow-[3px_3px_0_0_var(--color-anime-ink)] transition-all duration-200 active:translate-y-[1px] active:shadow-[2px_2px_0_0_var(--color-anime-ink)]",
        "md:pointer-events-none md:translate-y-2 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100",
        available
          ? "bg-anime-pink text-white"
          : "cursor-not-allowed bg-neutral-200 text-anime-ink/40",
      )}
    >
      {available && <UnitsFill />}
      <ShoppingBagIcon className="h-4 w-4" strokeWidth={2.5} />
      {available ? "Add to Cart" : "Sold Out"}
      {available && <UnitsArrow />}
    </button>
  );
}
