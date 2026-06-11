"use client";

import type { Product } from "lib/shopify/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Wishlist store. Favourites live in the browser (localStorage) so the heart
// works instantly with no login. When the customer is logged in (Shopify
// Customer Account API), the list is ALSO synced to their account — the local
// list is merged up on login and changes are written through. See
// docs/account-wishlist-setup.md.
export type WishlistItem = {
  handle: string;
  title: string;
  image?: { url: string; altText: string };
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
};

const STORAGE_KEY = "caseclosed:wishlist:v1";

export function toWishlistItem(product: Product): WishlistItem {
  return {
    handle: product.handle,
    title: product.title,
    image: product.featuredImage?.url
      ? {
          url: product.featuredImage.url,
          altText: product.featuredImage.altText || product.title,
        }
      : undefined,
    price: {
      amount: product.priceRange.maxVariantPrice.amount,
      currencyCode: product.priceRange.maxVariantPrice.currencyCode,
    },
    availableForSale: product.availableForSale,
  };
}

type Account = { loggedIn: boolean; email: string | null };

type WishlistContextType = {
  items: WishlistItem[];
  count: number;
  hydrated: boolean;
  account: Account;
  isInWishlist: (handle: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (handle: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

// Union by handle, keeping `a`'s order first then `b`'s extras.
function mergeByHandle(a: WishlistItem[], b: WishlistItem[]): WishlistItem[] {
  const seen = new Set(a.map((i) => i.handle));
  return [...a, ...b.filter((i) => !seen.has(i.handle))];
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<Account>({
    loggedIn: false,
    email: null,
  });

  // True once we've finished the initial local load + (if logged in) server
  // merge, so the write-through effect doesn't fire on the seed render.
  const readyForPush = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) Load local list immediately (no SSR mismatch — empty on first paint).
  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  // 2) Persist to localStorage on every change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [items, hydrated]);

  // 3) Cross-tab sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 4) Once hydrated, check the session. If logged in, merge the local list
  //    with the account list and write the union back to the account.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const acc = await fetch("/api/account").then((r) => r.json());
        if (cancelled) return;
        if (!acc?.loggedIn) {
          readyForPush.current = true;
          return;
        }
        setAccount({ loggedIn: true, email: acc.email ?? null });
        const remote = await fetch("/api/wishlist").then((r) => r.json());
        if (cancelled) return;
        const serverItems: WishlistItem[] = Array.isArray(remote?.items)
          ? remote.items
          : [];
        const local = readStorage();
        const merged = mergeByHandle(local, serverItems);
        setItems(merged);
        // Write the union back so both sides converge.
        await fetch("/api/wishlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: merged }),
        });
      } catch {
        /* offline / not configured — stay local-only */
      } finally {
        if (!cancelled) readyForPush.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  // 5) Write-through to the account on change (debounced), only when logged in.
  useEffect(() => {
    if (!readyForPush.current || !account.loggedIn) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      fetch("/api/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }, 600);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [items, account.loggedIn]);

  const isInWishlist = useCallback(
    (handle: string) => items.some((i) => i.handle === handle),
    [items],
  );

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.handle === item.handle)
        ? prev.filter((i) => i.handle !== item.handle)
        : [item, ...prev],
    );
  }, []);

  const remove = useCallback((handle: string) => {
    setItems((prev) => prev.filter((i) => i.handle !== handle));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      hydrated,
      account,
      isInWishlist,
      toggle,
      remove,
      clear,
    }),
    [items, hydrated, account, isInWishlist, toggle, remove, clear],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
