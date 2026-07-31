"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/shopify";
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function addItem(
  prevState: any,
  payload: { selectedVariantId: string | undefined; quantity?: number },
) {
  const { selectedVariantId, quantity = 1 } = payload;
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  try {
    const requested = Math.max(1, quantity);

    // Shopify silently clamps a line to available inventory instead of
    // erroring (and this store's Storefront token can't read
    // quantityAvailable up front). Compare the line before and after the add
    // so the shopper hears about the clamp instead of wondering why 2 became
    // 1. Line qty before:
    const before = await getCart();
    const prevQty =
      before?.lines.find((l) => l.merchandise.id === selectedVariantId)
        ?.quantity ?? 0;

    const after = await addToCart([
      { merchandiseId: selectedVariantId, quantity: requested },
    ]);
    updateTag(TAGS.cart);

    const newQty =
      after?.lines?.find((l) => l.merchandise.id === selectedVariantId)
        ?.quantity ?? prevQty;
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
}) {
  const { selectedVariantId, quantity = 1 } = payload;
  if (!selectedVariantId) return;

  await addToCart([
    { merchandiseId: selectedVariantId, quantity: Math.max(1, quantity) },
  ]);
  updateTag(TAGS.cart);

  const cart = await getCart();
  if (cart?.checkoutUrl) redirect(cart.checkoutUrl);
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

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
  },
) {
  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }]);
    }

    updateTag(TAGS.cart);
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout() {
  let cart = await getCart();
  redirect(cart!.checkoutUrl);
}

export async function createCartAndSetCookie() {
  let cart = await createCart();
  if (cart.id) {
    (await cookies()).set("cartId", cart.id);
  }
}
