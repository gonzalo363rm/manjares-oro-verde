"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  clearServerCart,
  getCart,
  mergeGuestCart,
  setCartItem,
} from "@/actions/cart";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  quantity: number;
  image?: string;
};

type CartMode = "guest" | "user";

type State = {
  cart: CartProduct[];
  mode: CartMode;
  hydrated: boolean;
  syncing: boolean;
  getTotalItems: () => number;
  setHydrated: (value: boolean) => void;
  setFromServer: (items: CartProduct[]) => void;
  enterUserMode: (items: CartProduct[]) => void;
  enterGuestMode: () => void;
  mergeOnLogin: () => Promise<void>;
  reloadFromServer: () => Promise<void>;
  addProduct: (product: CartProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
};

const guestOnlyStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }
  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      try {
        const parsed = JSON.parse(value) as { state?: { mode?: string } };
        if (parsed.state?.mode === "user") {
          localStorage.removeItem(name);
          return;
        }
      } catch {
        // ignore
      }
      localStorage.setItem(name, value);
    },
    removeItem: (name) => localStorage.removeItem(name),
  };
});

/** Per-product generation so older setCartItem responses never overwrite newer qty. */
const productSyncGen = new Map<string, number>();
let pendingMutations = 0;

async function syncSetItem(productId: string, quantity: number) {
  const gen = (productSyncGen.get(productId) ?? 0) + 1;
  productSyncGen.set(productId, gen);
  pendingMutations += 1;

  try {
    const result = await setCartItem({ productId, quantity });
    if (productSyncGen.get(productId) !== gen) return;

    if (!result.ok) {
      const fresh = await getCart();
      if (productSyncGen.get(productId) !== gen) return;
      if (fresh.ok) {
        useCartStore.getState().setFromServer(fresh.items);
      }
    }
    // On success keep optimistic local cart — applying result.items races with +/−.
  } finally {
    pendingMutations = Math.max(0, pendingMutations - 1);
  }
}

function mergeCartPreferLocal(
  server: CartProduct[],
  local: CartProduct[]
): CartProduct[] {
  const byId = new Map(server.map((item) => [item.id, item]));
  for (const item of local) {
    const existing = byId.get(item.id);
    if (!existing || item.quantity !== existing.quantity) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      cart: [],
      mode: "guest",
      hydrated: false,
      syncing: false,

      getTotalItems: () =>
        get().cart.reduce((total, item) => total + item.quantity, 0),

      setHydrated: (value) => set({ hydrated: value }),

      setFromServer: (items) => set({ cart: items, syncing: false }),

      enterUserMode: (items) => {
        set({ mode: "user", cart: items, syncing: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("manjares-cart-v1");
        }
      },

      enterGuestMode: () => set({ mode: "guest", cart: [], syncing: false }),

      mergeOnLogin: async () => {
        if (get().syncing) return;
        const guestItems = get().cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        }));
        // Enter user mode early so concurrent adds sync to the server.
        set({ syncing: true, mode: "user" });
        const result = await mergeGuestCart({ items: guestItems });
        const localDuring = get().cart;

        if (result.ok) {
          const merged = mergeCartPreferLocal(result.items, localDuring);
          set({ cart: merged, syncing: false, mode: "user" });
          if (typeof window !== "undefined") {
            localStorage.removeItem("manjares-cart-v1");
          }
          for (const item of localDuring) {
            const serverItem = result.items.find((i) => i.id === item.id);
            if (!serverItem || serverItem.quantity !== item.quantity) {
              void syncSetItem(item.id, item.quantity);
            }
          }
          return;
        }

        const fresh = await getCart();
        if (fresh.ok) {
          const merged = mergeCartPreferLocal(fresh.items, localDuring);
          set({ cart: merged, syncing: false, mode: "user" });
          return;
        }
        set({ cart: localDuring, syncing: false, mode: "user" });
      },

      reloadFromServer: async () => {
        if (get().mode !== "user") return;
        if (pendingMutations > 0 || get().syncing) return;
        set({ syncing: true });
        const fresh = await getCart();
        if (pendingMutations > 0) {
          set({ syncing: false });
          return;
        }
        if (fresh.ok) get().setFromServer(fresh.items);
        else set({ syncing: false });
      },

      addProduct: (product) => {
        const { cart, mode } = get();
        const existing = cart.find((item) => item.id === product.id);
        const nextQty = (existing?.quantity ?? 0) + product.quantity;
        const nextCart = existing
          ? cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: nextQty }
                : item
            )
          : [...cart, { ...product, quantity: nextQty }];
        set({ cart: nextCart });
        if (mode === "user") {
          void syncSetItem(product.id, nextQty);
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeProduct(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
        if (get().mode === "user") {
          void syncSetItem(productId, quantity);
        }
      },

      removeProduct: (productId) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) });
        if (get().mode === "user") {
          void syncSetItem(productId, 0);
        }
      },

      clearCart: () => {
        const prev = get().cart;
        set({ cart: [] });
        if (get().mode === "user") {
          for (const item of prev) {
            productSyncGen.set(
              item.id,
              (productSyncGen.get(item.id) ?? 0) + 1
            );
          }
          void clearServerCart();
        }
      },
    }),
    {
      name: "manjares-cart-v1",
      storage: guestOnlyStorage,
      // CartSeedProvider hydrates sync from server/LS before paint.
      skipHydration: true,
      partialize: (state) =>
        state.mode === "guest"
          ? { cart: state.cart, mode: state.mode }
          : { mode: "user" as const },
    }
  )
);
