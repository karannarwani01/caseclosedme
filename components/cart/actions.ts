"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/shopify";
import { cartItemKey, cartLineKey } from "lib/shopify/cart-line";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function addItem(
  prevState: any,
  payload: {
    selectedVariantId: string | undefined;
    quantity?: number;
    sellingPlanId?: string;
  },
) {
  const { selectedVariantId, quantity = 1, sellingPlanId } = payload;
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  try {
    const requested = Math.max(1, quantity);
    const key = cartLineKey(selectedVariantId, sellingPlanId);

    // Shopify silently clamps a line to available inventory instead of
    // erroring (and this store's Storefront token can't read
    // quantityAvailable up front). Compare the line before and after the add
    // so the shopper hears about the clamp instead of wondering why 2 became
    // 1. Line qty before:
    const before = await getCart();
    const prevQty =
      before?.lines.find((l) => cartItemKey(l) === key)?.quantity ?? 0;

    const after = await addToCart([
      {
        merchandiseId: selectedVariantId,
        quantity: requested,
        ...(sellingPlanId ? { sellingPlanId } : {}),
      },
    ]);
    updateTag(TAGS.cart);

    const newQty =
      after?.lines?.find((l) => cartItemKey(l) === key)?.quantity ?? prevQty;
    const actuallyAdded = newQty - prevQty;

    if (actuallyAdded < requested) {
      // Messages starting with "Only" are the clamp signal the client toasts.
      return newQty > 0
        ? `Only ${newQty} in stock — your cart has all of them.`
        : "Out of stock — nothing was added.";
    }
  } catch (e) {
    return "Error adding item to cart";
  }
}

// Buy Now: add the selected variant, then jump straight to Shopify checkout.
export async function buyNow(payload: {
  selectedVariantId: string | undefined;
  quantity?: number;
  sellingPlanId?: string;
}) {
  const { selectedVariantId, quantity = 1, sellingPlanId } = payload;
  if (!selectedVariantId) return;

  try {
    await addToCart([
      {
        merchandiseId: selectedVariantId,
        quantity: Math.max(1, quantity),
        ...(sellingPlanId ? { sellingPlanId } : {}),
      },
    ]);
  } catch (e) {
    // Don't let a failed add throw out of the form action (unhandled server
    // rejection). The shopper stays on the PDP with the cart unchanged.
    console.error("buyNow addToCart failed:", e);
    return;
  }
  updateTag(TAGS.cart);

  const cart = await getCart();
  // redirect() throws NEXT_REDIRECT internally, so it sits outside the catch.
  if (cart?.checkoutUrl) redirect(cart.checkoutUrl);
}

export async function removeItem(
  prevState: any,
  payload: { merchandiseId: string; sellingPlanId?: string },
) {
  const { merchandiseId, sellingPlanId } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const key = cartLineKey(merchandiseId, sellingPlanId);
    const lineItem = cart.lines.find((line) => cartItemKey(line) === key);

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id]);
      updateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
    sellingPlanId?: string;
  },
) {
  const { merchandiseId, quantity, sellingPlanId } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const key = cartLineKey(merchandiseId, sellingPlanId);
    const lineItem = cart.lines.find((line) => cartItemKey(line) === key);

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
            // Omitting this on a subscription line would strip the plan and
            // silently convert it to a one-time purchase.
            ...(sellingPlanId ? { sellingPlanId } : {}),
          },
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([
        {
          merchandiseId,
          quantity,
          ...(sellingPlanId ? { sellingPlanId } : {}),
        },
      ]);
    }

    updateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout() {
  let cart = await getCart();
  // The cart cookie can be stale (Shopify nulls carts after checkout) while
  // the optimistic client cart still shows lines — degrade instead of throwing.
  if (!cart?.checkoutUrl) {
    redirect("/");
  }
  redirect(cart.checkoutUrl);
}

export async function createCartAndSetCookie() {
  let cart = await createCart();
  if (cart.id) {
    // Persist the cart pointer: without explicit options this was a session
    // cookie that vanished when the browser closed, silently emptying a
    // returning shopper's cart (Shopify keeps the cart server-side ~10 days).
    // Read server-side only, so httpOnly is safe.
    (await cookies()).set("cartId", cart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 10, // 10 days, matching Shopify's cart TTL
    });
  }
}
