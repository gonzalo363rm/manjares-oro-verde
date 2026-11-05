"use server";

import { auth } from "@/auth";
import { cartInclude, mapCartToDto } from "@/actions/cart/cart-dto";
import {
  mergeGuestCartSchema,
  type MergeGuestCartInput,
} from "@/actions/cart/schemas";
import { prisma } from "@/lib/prisma";

export async function mergeGuestCart(raw: MergeGuestCartInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false as const, error: "No autenticado", items: [] };
  }

  const parsed = mergeGuestCartSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Datos inválidos", items: [] };
  }

  const guestItems = parsed.data.items;
  const productIds = guestItems.map((i) => i.productId);
  const activeProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    select: { id: true },
  });
  const activeIds = new Set(activeProducts.map((p) => p.id));

  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    for (const item of guestItems) {
      if (!activeIds.has(item.productId)) continue;
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId,
          },
        },
      });
      const nextQty = Math.min(
        999,
        (existing?.quantity ?? 0) + item.quantity
      );
      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: nextQty },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
      }
    }
  });

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  return { ok: true as const, items: mapCartToDto(cart) };
}
