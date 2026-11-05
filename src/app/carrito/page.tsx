import { Suspense } from "react";

import { CarritoClient } from "@/components/cart/CarritoClient";
import { CartPageSkeleton } from "@/components/cart/CartPageSkeleton";

export default function CarritoPage() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CarritoClient />
    </Suspense>
  );
}
