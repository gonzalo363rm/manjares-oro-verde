"use client";

import { createContext, use, useRef, type ReactNode } from "react";

import {
  useCartStore,
  type CartProduct,
} from "@/store/cart/cart-store";

const CartSeedContext = createContext<CartProduct[] | null>(null);

type Props = {
  initialServerCart: CartProduct[] | null;
  children: ReactNode;
};

function readGuestCartFromStorage(): CartProduct[] | null {
  try {
    const raw = localStorage.getItem("manjares-cart-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { mode?: string; cart?: CartProduct[] };
    };
    if (
      parsed.state?.mode === "guest" &&
      Array.isArray(parsed.state.cart) &&
      parsed.state.cart.length > 0
    ) {
      return parsed.state.cart;
    }
  } catch {
    // ignore quota / private mode / bad JSON
  }
  return null;
}

/**
 * Provides SSR cart quantities and seeds the client store before children paint.
 * Never writes to the Zustand singleton on the server (avoids cross-request leaks).
 *
 * If the user just logged in and still has a guest cart in LS, keep guest mode so
 * CartSync → mergeOnLogin can sum those items into the DB cart.
 */
export function CartSeedProvider({ initialServerCart, children }: Props) {
  const didSeed = useRef(false);

  if (typeof window !== "undefined" && !didSeed.current) {
    didSeed.current = true;

    const guestCart = readGuestCartFromStorage();

    if (initialServerCart && !guestCart) {
      useCartStore.setState({
        cart: initialServerCart,
        mode: "user",
        hydrated: true,
        syncing: false,
      });
    } else if (guestCart) {
      useCartStore.setState({
        cart: guestCart,
        mode: "guest",
        hydrated: true,
        syncing: false,
      });
    } else {
      useCartStore.setState({ hydrated: true });
    }
  }

  return (
    <CartSeedContext value={initialServerCart}>{children}</CartSeedContext>
  );
}

export function useSeededCartQuantity(productId: string): number {
  const seed = use(CartSeedContext);
  if (!seed) return 0;
  return seed.find((item) => item.id === productId)?.quantity ?? 0;
}

export function useSeededCartTotal(): number {
  const seed = use(CartSeedContext);
  if (!seed) return 0;
  return seed.reduce((total, item) => total + item.quantity, 0);
}
