"use server";

import { auth } from "@/auth";
import { cartInclude, mapCartToDto } from "@/actions/cart/cart-dto";
import {
  setCartItemSchema,
  type SetCartItemInput,
} from "@/actions/cart/schemas";
import { prisma } from "@/lib/prisma";

export async function setCartItem(raw: SetCartItemInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false as const, error: "No autenticado", items: [] };
  }

  const parsed = setCartItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Datos inválidos", items: [] };
  }

  const { productId, quantity } = parsed.data;

  if (quantity > 0) {
    const product = await prisma.product.findFirst({
      where: { id: productId, active: true },
    });
    if (!product) {
      return { ok: false as const, error: "Producto no disponible", items: [] };
    }
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
  } else {
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity },
    });
  }

  const next = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  return { ok: true as const, items: mapCartToDto(next) };
}
