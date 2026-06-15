"use client";

import { BoltIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem, buyNow } from "components/cart/actions";
import { Product, ProductVariant } from "lib/shopify/types";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { useCart } from "./cart-context";

function QuantityStepper({
  quantity,
  setQuantity,
  disabled,
}: {
  quantity: number;
  setQuantity: (fn: (q: number) => number) => void;
  disabled: boolean;
}) {
  return (
    <div className="inline-flex w-fit items-center self-start rounded-full border-[2.5px] border-anime-ink bg-white shadow-[2px_2px_0_0_var(--color-anime-ink)]">
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
        className="grid h-10 w-10 place-items-center text-anime-ink transition-colors hover:text-anime-pink disabled:opacity-40"
      >
        <MinusIcon className="h-4" strokeWidth={3} />
      </button>
      <span className="min-w-[2.75rem] text-center font-display text-base font-extrabold tabular-nums text-anime-ink">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity((q) => q + 1)}
        disabled={disabled}
        aria-label="Increase quantity"
        className="grid h-10 w-10 place-items-center text-anime-ink transition-colors hover:text-anime-pink disabled:opacity-40"
      >
        <PlusIcon className="h-4" strokeWidth={3} />
      </button>
    </div>
  );
}

function SubmitButton({
  availableForSale,
  selectedVariantId,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center gap-2 rounded-full border-[2.5px] border-anime-ink bg-anime-pink p-4 font-display text-sm font-extrabold uppercase tracking-wider text-white shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-ink)]";
  const disabledClasses =
    "cursor-not-allowed opacity-60 hover:translate-x-0 hover:translate-y-0 hover:shadow-[5px_5px_0_0_var(--color-anime-ink)]";

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out of stock
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <PlusIcon className="h-5" strokeWidth={3} />
        Add to cart
      </button>
    );
  }

  return (
    <button aria-label="Add to cart" className={buttonClasses}>
      <PlusIcon className="h-5" strokeWidth={3} />
      Add to cart
    </button>
  );
}

function BuyNowButton({
  availableForSale,
  selectedVariantId,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const classes =
    "relative flex w-full items-center justify-center gap-2 rounded-full border-[2.5px] border-anime-ink bg-anime-ink p-4 font-display text-sm font-extrabold uppercase tracking-wider text-white shadow-[5px_5px_0_0_var(--color-anime-pink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-pink)]";
  const disabled =
    "cursor-not-allowed opacity-60 hover:translate-x-0 hover:translate-y-0 hover:shadow-[5px_5px_0_0_var(--color-anime-pink)]";
  const blocked = !availableForSale || !selectedVariantId;

  return (
    <button
      type="submit"
      disabled={blocked}
      aria-label="Buy it now"
      className={clsx(classes, blocked && disabled)}
    >
      <BoltIcon className="h-5" strokeWidth={2.5} />
      Buy it now
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const searchParams = useSearchParams();
  const [message, formAction] = useActionState(addItem, null);
  const [quantity, setQuantity] = useState(1);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === searchParams.get(option.name.toLowerCase()),
    ),
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const addItemAction = formAction.bind(null, { selectedVariantId, quantity });
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  )!;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <span className="font-display text-sm font-extrabold uppercase tracking-wider text-anime-ink">
          Quantity
        </span>
        <QuantityStepper
          quantity={quantity}
          setQuantity={setQuantity}
          disabled={!availableForSale}
        />
      </div>
      <form
        action={async () => {
          for (let i = 0; i < quantity; i++) addCartItem(finalVariant, product);
          addItemAction();
        }}
      >
        <SubmitButton
          availableForSale={availableForSale}
          selectedVariantId={selectedVariantId}
        />
        <p aria-live="polite" className="sr-only" role="status">
          {message}
        </p>
      </form>

      <form action={buyNow.bind(null, { selectedVariantId, quantity })}>
        <BuyNowButton
          availableForSale={availableForSale}
          selectedVariantId={selectedVariantId}
        />
      </form>
    </div>
  );
}
