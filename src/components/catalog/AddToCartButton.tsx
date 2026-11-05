"use client";

import { useState } from "react";

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
  const addProduct = useCartStore((s) => s.addProduct);
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      className="rounded-full"
      onClick={() => {
        addProduct({ ...product, quantity: 1 });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Agregado" : "Agregar"}
    </Button>
  );
}
