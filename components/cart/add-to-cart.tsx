"use client";

import { BoltIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem, buyNow } from "components/cart/actions";
import { UnitsArrow } from "components/ui/units-arrow";
import { UnitsFill } from "components/ui/units-fill";
import { Product, ProductVariant, SellingPlan } from "lib/shopify/types";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "./cart-context";

function QuantityStepper({
  quantity,
  setQuantity,
  disabled,
  max,
}: {
  quantity: number;
  setQuantity: (fn: (q: number) => number) => void;
  disabled: boolean;
  // Available stock when the Storefront token can read it; null = unknown
  // (inventory scope not granted), in which case the stepper is uncapped and
  // the server-side clamp toast is the safety net.
  max: number | null;
}) {
  const atMax = max !== null && quantity >= max;
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
        onClick={() => {
          if (atMax) {
            toast(`😣 Only ${max} in stock`);
            return;
          }
          setQuantity((q) => (max !== null ? Math.min(max, q + 1) : q + 1));
        }}
        disabled={disabled}
        aria-disabled={atMax}
        aria-label="Increase quantity"
        className={clsx(
          "grid h-10 w-10 place-items-center text-anime-ink transition-colors hover:text-anime-pink disabled:opacity-40",
          atMax && "opacity-40",
        )}
      >
        <PlusIcon className="h-4" strokeWidth={3} />
      </button>
    </div>
  );
}

// "Save 15%" / "Save AED 10" for a plan, when the discount is expressible as
// one. Returns null for fixed-price and unrecognised adjustment types rather
// than inventing a number.
function planSavingsLabel(plan: SellingPlan): string | null {
  const value = plan.priceAdjustments?.[0]?.adjustmentValue;
  if (!value) return null;
  if ("adjustmentPercentage" in value && value.adjustmentPercentage) {
    return `Save ${value.adjustmentPercentage}%`;
  }
  if ("adjustmentAmount" in value && value.adjustmentAmount) {
    return `Save ${value.adjustmentAmount.currencyCode} ${value.adjustmentAmount.amount}`;
  }
  return null;
}

// Rendered only when the product actually has selling plans attached, so a
// store with no subscriptions sees exactly the pre-existing PDP.
function PurchaseOptions({
  plans,
  selectedPlanId,
  onSelect,
}: {
  plans: SellingPlan[];
  selectedPlanId: string | undefined;
  onSelect: (id: string | undefined) => void;
}) {
  const options: {
    id: string | undefined;
    label: string;
    note: string | null;
  }[] = [
    { id: undefined, label: "One-time purchase", note: null },
    ...plans.map((plan) => ({
      id: plan.id,
      label: plan.name,
      note: planSavingsLabel(plan),
    })),
  ];

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-display text-sm font-extrabold uppercase tracking-wider text-anime-ink">
        Purchase options
      </legend>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const checked = option.id === selectedPlanId;
          return (
            <label
              key={option.id ?? "one-time"}
              className={clsx(
                "flex cursor-pointer items-center gap-3 rounded-2xl border-[2.5px] border-anime-ink px-4 py-3 transition-all",
                checked
                  ? "bg-anime-yellow shadow-[3px_3px_0_0_var(--color-anime-ink)]"
                  : "bg-white hover:-translate-y-[1px]",
              )}
            >
              <input
                type="radio"
                name="purchase-option"
                className="h-4 w-4 accent-anime-pink"
                checked={checked}
                onChange={() => onSelect(option.id)}
              />
              <span className="font-display text-sm font-extrabold text-anime-ink">
                {option.label}
              </span>
              {option.note ? (
                <span className="ml-auto inline-flex items-center rounded-full border-[2px] border-anime-ink bg-anime-lime px-2 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-anime-ink">
                  {option.note}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SubmitButton({
  availableForSale,
  selectedVariantId,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  // The panel's primary action. Sized to lead the stack — it used to be
  // text-sm while the yellow Save It below it was text-xl, so the buy button
  // was the smallest thing on the panel.
  const buttonClasses =
    "cc-units cc-u-grape relative flex w-full items-center justify-center gap-2.5 rounded-full border-[3px] border-anime-ink bg-anime-pink px-7 py-5 font-display text-lg font-extrabold uppercase tracking-wider text-white shadow-[5px_5px_0_0_var(--color-anime-ink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-ink)] md:text-xl";
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
        <PlusIcon className="h-6" strokeWidth={3} />
        Add to cart
      </button>
    );
  }

  return (
    <button aria-label="Add to cart" className={buttonClasses}>
      <UnitsFill />
      <PlusIcon className="h-6" strokeWidth={3} />
      Add to cart
      <UnitsArrow className="ml-0.5" />
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
  // Secondary to Add to Cart: one step down in scale, still bigger than the
  // old text-sm version.
  const classes =
    "cc-units cc-u-ice relative flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-anime-ink bg-anime-ink px-7 py-4 font-display text-base font-extrabold uppercase tracking-wider text-white shadow-[5px_5px_0_0_var(--color-anime-pink)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_var(--color-anime-pink)] md:text-lg";
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
      <UnitsFill />
      <BoltIcon className="h-6" strokeWidth={2.5} />
      Buy it now
      <UnitsArrow className="ml-0.5" />
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const searchParams = useSearchParams();
  const [message, formAction] = useActionState(addItem, null);
  const [quantity, setQuantity] = useState(1);

  // Flattened across groups: shoppers pick a cadence, not a group.
  const sellingPlans = (product.sellingPlanGroups ?? []).flatMap(
    (group) => group.sellingPlans,
  );
  // undefined = one-time purchase, which stays the default.
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(
    undefined,
  );
  const selectedPlan = sellingPlans.find((plan) => plan.id === selectedPlanId);

  // Shopify clamps adds to available stock without erroring; the action
  // reports it back ("Only N in stock…"). Say it out loud — silently turning
  // 2 into 1 reads as a glitch.
  useEffect(() => {
    if (!message) return;
    if (message.startsWith("Only") || message.startsWith("Out of stock")) {
      toast(`😣 ${message}`);
    } else {
      toast(`⚠️ ${message}`);
    }
  }, [message]);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === searchParams.get(option.name.toLowerCase()),
    ),
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const addItemAction = formAction.bind(null, {
    selectedVariantId,
    quantity,
    sellingPlanId: selectedPlanId,
  });
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  )!;

  // Stock for the selected variant, when the Storefront token can read it
  // (self-activates once the inventory scope is ticked on the Headless
  // channel; until then quantityAvailable is null and nothing changes).
  const stock =
    typeof finalVariant?.quantityAvailable === "number" &&
    finalVariant.quantityAvailable > 0
      ? finalVariant.quantityAvailable
      : null;

  // Variant switches can lower the ceiling; pull the chosen quantity down.
  useEffect(() => {
    if (stock !== null) setQuantity((q) => Math.min(q, stock));
  }, [stock]);

  return (
    <div className="flex flex-col gap-3">
      {sellingPlans.length > 0 ? (
        <PurchaseOptions
          plans={sellingPlans}
          selectedPlanId={selectedPlanId}
          onSelect={setSelectedPlanId}
        />
      ) : null}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-extrabold uppercase tracking-wider text-anime-ink">
            Quantity
          </span>
          {stock !== null && stock <= 5 ? (
            <span className="inline-flex -rotate-2 items-center rounded-full border-[2px] border-anime-ink bg-anime-yellow px-2.5 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-anime-ink shadow-[2px_2px_0_0_var(--color-anime-ink)]">
              🔥 Only {stock} left!
            </span>
          ) : null}
        </div>
        <QuantityStepper
          quantity={quantity}
          setQuantity={setQuantity}
          disabled={!availableForSale}
          max={stock}
        />
      </div>
      <form
        action={async () => {
          for (let i = 0; i < quantity; i++)
            addCartItem(finalVariant, product, selectedPlan);
          // Await so the form action stays pending through the server
          // round-trip and the optimistic add isn't reverted early.
          await addItemAction();
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

      <form
        action={buyNow.bind(null, {
          selectedVariantId,
          quantity,
          sellingPlanId: selectedPlanId,
        })}
      >
        <BuyNowButton
          availableForSale={availableForSale}
          selectedVariantId={selectedVariantId}
        />
      </form>
    </div>
  );
}
