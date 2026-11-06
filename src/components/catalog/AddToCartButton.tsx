"use client";

import { IoAdd, IoCartOutline, IoRemove } from "react-icons/io5";

import { useSeededCartQuantity } from "@/components/cart/cart-seed-context";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart/cart-store";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | null;
    image?: string;
  };
};

export function AddToCartButton({ product }: Props) {
  const hydrated = useCartStore((s) => s.hydrated);
  const storeQuantity = useCartStore(
    (s) => s.cart.find((item) => item.id === product.id)?.quantity ?? 0
  );
  const seededQuantity = useSeededCartQuantity(product.id);
  const quantity = hydrated ? storeQuantity : seededQuantity;

  const addProduct = useCartStore((s) => s.addProduct);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeProduct = useCartStore((s) => s.removeProduct);

  if (quantity <= 0) {
    return (
      <Button
        type="button"
        size="sm"
        className="gap-1.5 rounded-full"
        disabled={!hydrated}
        onClick={() => addProduct({ ...product, quantity: 1 })}
      >
        <IoCartOutline className="size-4" aria-hidden />
        Agregar
      </Button>
    );
  }

  return (
    <div
      className="flex items-center rounded-full border border-border bg-card"
      suppressHydrationWarning
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        aria-label="Restar"
        onClick={() => {
          if (quantity <= 1) removeProduct(product.id);
          else updateQuantity(product.id, quantity - 1);
        }}
      >
        <IoRemove />
      </Button>
      <span
        className="min-w-7 text-center text-sm font-medium tabular-nums"
        suppressHydrationWarning
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        aria-label="Sumar"
        onClick={() => updateQuantity(product.id, quantity + 1)}
      >
        <IoAdd />
      </Button>
    </div>
  );
}
