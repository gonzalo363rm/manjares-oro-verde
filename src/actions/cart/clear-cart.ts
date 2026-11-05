"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function clearServerCart() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false as const, error: "No autenticado" };
  }

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return { ok: true as const, items: [] as const };
}
