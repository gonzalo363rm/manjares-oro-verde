"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { after } from "next/server";

import { auth } from "@/auth";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "@/actions/orders/schemas";
import { generateUniqueOrderCode } from "@/lib/generate-order-code";
import { normalizeOrderCode } from "@/lib/order-code";
import { sumItemsTotal } from "@/lib/order-money";
import { notifyAdminNewOrder } from "@/lib/notifications/order-email";
import { prisma } from "@/lib/prisma";
import {
  buildOrderMessage,
  buildWaMeUrl,
  type WaCartItem,
} from "@/lib/whatsapp";

export type CreateOrderResult =
  | {
      ok: true;
      code: string;
      reused: boolean;
      waUrl: string;
      message: string;
    }
  | { ok: false; error: string };

export async function createOrder(
  raw: CreateOrderInput
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Datos del pedido inválidos" };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const data = parsed.data;
  const contactName = data.contactName.trim();
  const contactPhone = data.contactPhone.trim();

  if (data.existingCode) {
    const code = normalizeOrderCode(data.existingCode);
    const existing = await prisma.order.findUnique({
      where: { code },
      include: { items: true },
    });

    const sameOwner =
      existing?.userId != null
        ? existing.userId === userId
        : userId == null;

    if (
      existing &&
      existing.cartHash === data.cartHash &&
      existing.status === "PENDIENTE_CONFIRMACION" &&
      sameOwner
    ) {
      const waItems: WaCartItem[] = existing.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice ? Number(i.unitPrice) : null,
      }));
      const message = buildOrderMessage(existing.code, waItems, {
        contactName: existing.contactName,
        contactPhone: existing.contactPhone,
        contactEmail: existing.contactEmail,
        eventDate: existing.eventDate?.toISOString().slice(0, 10) ?? null,
        eventType: existing.eventType,
        guests: existing.guests,
        comments: existing.comments,
      });

      return {
        ok: true,
        code: existing.code,
        reused: true,
        waUrl: buildWaMeUrl(message),
        message,
      };
    }
  }

  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: { category: { select: { id: true, name: true } } },
  });

  if (products.length !== new Set(productIds).size) {
    return {
      ok: false,
      error: "Algunos productos ya no están disponibles",
    };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderItems = data.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: product.id,
      productName: product.name,
      categoryId: product.category.id,
      categoryName: product.category.name,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const itemsTotal = sumItemsTotal(
    orderItems.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unitPrice ? Number(i.unitPrice) : null,
    }))
  );

  let eventDate: Date | null = null;
  if (data.eventDate) {
    const d = new Date(data.eventDate);
    if (!Number.isNaN(d.getTime())) eventDate = d;
  }

  const code = await generateUniqueOrderCode();
  const contactEmail = data.contactEmail?.trim() || null;

  const order = await prisma.$transaction(async (tx) => {
    if (userId) {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { contactPhone: true },
      });

      if (user && !user.contactPhone?.trim() && contactPhone) {
        await tx.user.update({
          where: { id: userId },
          data: {
            contactName: contactName || null,
            contactPhone,
            contactEmail,
          },
        });
      }
    }

    return tx.order.create({
      data: {
        code,
        status: "PENDIENTE_CONFIRMACION",
        userId,
        contactName,
        contactPhone,
        contactEmail,
        eventDate,
        eventType: data.eventType || null,
        guests: data.guests ?? null,
        comments: data.comments || null,
        cartHash: data.cartHash,
        itemsTotal:
          itemsTotal == null ? null : new Decimal(itemsTotal.toFixed(2)),
        total: itemsTotal == null ? null : new Decimal(itemsTotal.toFixed(2)),
        items: {
          create: orderItems.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            categoryId: i.categoryId,
            categoryName: i.categoryName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
  });

  const waItems: WaCartItem[] = order.items.map((i) => ({
    name: i.productName,
    quantity: i.quantity,
    unitPrice: i.unitPrice ? Number(i.unitPrice) : null,
  }));

  const message = buildOrderMessage(order.code, waItems, {
    contactName: order.contactName,
    contactPhone: order.contactPhone,
    contactEmail: order.contactEmail,
    eventDate: order.eventDate?.toISOString().slice(0, 10) ?? null,
    eventType: order.eventType,
    guests: order.guests,
    comments: order.comments,
  });

  after(async () => {
    try {
      await notifyAdminNewOrder({
        code: order.code,
        contactName: order.contactName,
        contactPhone: order.contactPhone,
        eventDate: order.eventDate?.toISOString().slice(0, 10) ?? null,
        eventType: order.eventType,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice ? Number(i.unitPrice) : null,
        })),
        total: order.total ? Number(order.total) : null,
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { adminNotifiedAt: new Date() },
      });
    } catch (err) {
      console.error("[createOrder] notify admin failed", err);
    }
  });

  return {
    ok: true,
    code: order.code,
    reused: false,
    waUrl: buildWaMeUrl(message),
    message,
  };
}
