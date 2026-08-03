"use client";

import { cartItemKey, cartLineKey } from "lib/shopify/cart-line";
import type {
  Cart,
  CartItem,
  Product,
  ProductVariant,
  SellingPlan,
} from "lib/shopify/types";
import React, {
  createContext,
  use,
  useContext,
  useMemo,
  useOptimistic,
} from "react";

type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: {
        merchandiseId: string;
        sellingPlanId?: string;
        updateType: UpdateType;
      };
    }
  | {
      type: "ADD_ITEM";
      payload: {
        variant: ProductVariant;
        product: Product;
        sellingPlan?: SellingPlan;
      };
    };

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType,
): CartItem | null {
  if (updateType === "delete") return null;

  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString(),
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  sellingPlan?: SellingPlan,
): CartItem {
  const quantity = existingItem ? existingItem.quantity + 1 : 1;
  // Optimistic total uses the variant's one-time price even on a subscription
  // line — the plan's price adjustment is applied by Shopify, so the real
  // total lands when the server cart resolves a moment later.
  const totalAmount = calculateItemCost(quantity, variant.price.amount);

  return {
    id: existingItem?.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    sellingPlanAllocation: sellingPlan
      ? {
          sellingPlan: {
            id: sellingPlan.id,
            name: sellingPlan.name,
            recurringDeliveries: sellingPlan.recurringDeliveries,
          },
        }
      : null,
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
}

function updateCartTotals(
  lines: CartItem[],
): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0,
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "USD";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "USD" },
      totalAmount: { amount: "0", currencyCode: "USD" },
      totalTaxAmount: { amount: "0", currencyCode: "USD" },
    },
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  switch (action.type) {
    case "UPDATE_ITEM": {
      const { merchandiseId, sellingPlanId, updateType } = action.payload;
      const targetKey = cartLineKey(merchandiseId, sellingPlanId);
      const updatedLines = currentCart.lines
        .map((item) =>
          cartItemKey(item) === targetKey
            ? updateCartItem(item, updateType)
            : item,
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: "0" },
          },
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product, sellingPlan } = action.payload;
      const targetKey = cartLineKey(variant.id, sellingPlan?.id);
      const existingItem = currentCart.lines.find(
        (item) => cartItemKey(item) === targetKey,
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        sellingPlan,
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            cartItemKey(item) === targetKey ? updatedItem : item,
          )
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
}

export function CartProvider({
  children,
  cartPromise,
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  return (
    <CartContext.Provider value={{ cartPromise }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const initialCart = use(context.cartPromise);
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    initialCart,
    cartReducer,
  );

  const updateCartItem = (
    merchandiseId: string,
    updateType: UpdateType,
    sellingPlanId?: string,
  ) => {
    updateOptimisticCart({
      type: "UPDATE_ITEM",
      payload: { merchandiseId, sellingPlanId, updateType },
    });
  };

  const addCartItem = (
    variant: ProductVariant,
    product: Product,
    sellingPlan?: SellingPlan,
  ) => {
    updateOptimisticCart({
      type: "ADD_ITEM",
      payload: { variant, product, sellingPlan },
    });
  };

  return useMemo(
    () => ({
      cart: optimisticCart,
      updateCartItem,
      addCartItem,
    }),
    [optimisticCart],
  );
}
