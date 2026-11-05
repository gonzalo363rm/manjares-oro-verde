"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

import {
  adminUpdateOrderSchema,
  type AdminUpdateOrderInput,
} from "@/actions/orders/schemas";
import { requireAdmin } from "@/lib/admin-guard";
import { normalizeOrderCode } from "@/lib/order-code";
import {
  calcOrderTotal,
  roundMoney,
  sumItemsTotal,
  toNumber,
} from "@/lib/order-money";
import { isSaleStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export type AdminUpdateOrderResult =
  | { ok: true }
  | { ok: false; error: string };

function snapshotOrder(order: {
  status: string;
  deliveryMethod: string | null;
  shippingCost: Decimal | null;
  itemsTotal: Decimal | null;
  total: Decimal | null;
  depositAmount: Decimal | null;
  discountAmount: Decimal | null;
  discountReason: string | null;
  totalOverride: boolean;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: Decimal | null;
  }>;
}) {
  return {
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    shippingCost: toNumber(order.shippingCost),
    itemsTotal: toNumber(order.itemsTotal),
    total: toNumber(order.total),
    depositAmount: toNumber(order.depositAmount),
    discountAmount: toNumber(order.discountAmount),
    discountReason: order.discountReason,
    totalOverride: order.totalOverride,
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: toNumber(i.unitPrice),
    })),
  };
}

export async function adminUpdateOrder(
  raw: AdminUpdateOrderInput
): Promise<AdminUpdateOrderResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = adminUpdateOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos" };
  }

  const data = parsed.data;
  const code = normalizeOrderCode(data.code);
  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true },
  });

  if (!order) {
    return { ok: false, error: "Pedido no encontrado" };
  }

  const deliveryMethod = data.deliveryMethod ?? null;
  const shippingCostValue =
    deliveryMethod === "ENVIO"
      ? data.shippingCost == null
        ? null
        : roundMoney(data.shippingCost)
      : 0;

  const itemsForTotal = data.items.map((i) => ({
    quantity: i.quantity,
    unitPrice: i.unitPrice ?? null,
  }));
  const itemsTotal = sumItemsTotal(itemsForTotal);
  const discountAmount = Math.min(
    data.discountAmount ?? 0,
    itemsTotal ?? 0
  );
  const totalOverride = Boolean(data.totalOverride);
  const computedTotal = calcOrderTotal({
    itemsTotal,
    shippingCost: shippingCostValue,
    discountAmount,
    totalOverride,
    overrideTotal: data.total,
  });

  if (computedTotal == null && totalOverride) {
    return { ok: false, error: "Indicá el total manual" };
  }

  const depositAmount =
    data.depositAmount == null ? null : roundMoney(data.depositAmount);
  if (
    depositAmount != null &&
    computedTotal != null &&
    depositAmount > computedTotal
  ) {
    return { ok: false, error: "La seña no puede superar el total" };
  }

  const before = snapshotOrder(order);
  const existingIds = new Set(order.items.map((i) => i.id));
  const incomingWithId = data.items.filter((i) => i.id && existingIds.has(i.id));
  const incomingIds = new Set(incomingWithId.map((i) => i.id!));
  const toDelete = order.items.filter((i) => !incomingIds.has(i.id));
  const toCreate = data.items.filter((i) => !i.id || !existingIds.has(i.id));

  let confirmedAt = order.confirmedAt;
  if (isSaleStatus(data.status)) {
    if (!confirmedAt) confirmedAt = new Date();
  } else {
    confirmedAt = null;
  }

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.orderItem.deleteMany({
        where: { id: { in: toDelete.map((i) => i.id) } },
      });
    }

    for (const item of incomingWithId) {
      await tx.orderItem.update({
        where: { id: item.id! },
        data: {
          productName: item.productName,
          productId: item.productId || null,
          categoryId: item.categoryId || null,
          categoryName: item.categoryName || null,
          quantity: item.quantity,
          unitPrice:
            item.unitPrice == null
              ? null
              : new Decimal(item.unitPrice.toFixed(2)),
        },
      });
    }

    if (toCreate.length) {
      await tx.orderItem.createMany({
        data: toCreate.map((item) => ({
          orderId: order.id,
          productId: item.productId || null,
          productName: item.productName,
          categoryId: item.categoryId || null,
          categoryName: item.categoryName || null,
          quantity: item.quantity,
          unitPrice:
            item.unitPrice == null
              ? null
              : new Decimal(item.unitPrice.toFixed(2)),
        })),
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: data.status,
        deliveryMethod,
        shippingAddress:
          deliveryMethod === "ENVIO" ? data.shippingAddress || null : null,
        shippingCost:
          shippingCostValue == null
            ? null
            : new Decimal(shippingCostValue.toFixed(2)),
        itemsTotal:
          itemsTotal == null ? null : new Decimal(itemsTotal.toFixed(2)),
        total:
          computedTotal == null
            ? null
            : new Decimal(computedTotal.toFixed(2)),
        depositAmount:
          depositAmount == null
            ? null
            : new Decimal(depositAmount.toFixed(2)),
        discountAmount:
          discountAmount > 0
            ? new Decimal(discountAmount.toFixed(2))
            : null,
        discountReason: data.discountReason || null,
        totalOverride,
        adminNotes: data.adminNotes || null,
        confirmedAt,
      },
    });

    const afterSnap = {
      status: data.status,
      deliveryMethod,
      shippingCost: shippingCostValue,
      itemsTotal,
      total: computedTotal,
      depositAmount,
      discountAmount: discountAmount > 0 ? discountAmount : null,
      discountReason: data.discountReason || null,
      totalOverride,
      items: data.items.map((i) => ({
        id: i.id ?? "new",
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice ?? null,
      })),
    };

    const moneyChanged =
      JSON.stringify(before.items) !== JSON.stringify(afterSnap.items) ||
      before.total !== afterSnap.total ||
      before.discountAmount !== afterSnap.discountAmount ||
      before.shippingCost !== afterSnap.shippingCost ||
      before.totalOverride !== afterSnap.totalOverride;

    if (moneyChanged || before.status !== afterSnap.status) {
      await tx.orderChangeLog.create({
        data: {
          orderId: order.id,
          adminEmail: gate.admin.email,
          summary: moneyChanged
            ? "Actualización de ítems / montos"
            : `Estado → ${data.status}`,
          before,
          after: afterSnap,
        },
      });
    }
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${code}`);
  revalidatePath(`/pedido/${code}`);
  revalidatePath("/mis-pedidos");
  revalidatePath("/admin");

  return { ok: true };
}
