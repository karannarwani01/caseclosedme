import type { CartItem } from "./types";

// A cart line is identified by variant AND selling plan, not variant alone.
// The same variant can legitimately sit in the cart twice — once as a one-time
// purchase and once on a subscription — and Shopify keeps those as separate
// lines. Matching on merchandise.id alone silently targets whichever line
// happens to come first, so every lookup goes through here.
export function cartLineKey(
  merchandiseId: string,
  sellingPlanId?: string | null,
): string {
  return `${merchandiseId}::${sellingPlanId ?? ""}`;
}

export function cartItemKey(item: CartItem): string {
  return cartLineKey(
    item.merchandise.id,
    item.sellingPlanAllocation?.sellingPlan.id,
  );
}
