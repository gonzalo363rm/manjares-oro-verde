"use server";

import { auth } from "@/auth";
import { cartInclude, mapCartToDto } from "@/actions/cart/cart-dto";
import { prisma } from "@/lib/prisma";

export async function getCart() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false as const, error: "No autenticado", items: [] };

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  return { ok: true as const, items: mapCartToDto(cart) };
}
