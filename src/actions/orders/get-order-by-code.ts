"use server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { normalizeOrderCode } from "@/lib/order-code";
import { calcRemaining, toNumber } from "@/lib/order-money";
import { maskContactName, maskShippingAddress } from "@/lib/mask";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

export type PublicOrderView = {
  code: string;
  status: string;
  statusLabel: string;
  contactDisplay: string;
  eventDate: string | null;
  eventType: string | null;
  guests: number | null;
  comments: string | null;
  deliveryMethod: string | null;
  shippingAddressDisplay: string | null;
  shippingCost: number | null;
  itemsTotal: number | null;
  discountAmount: number | null;
  discountReason: string | null;
  total: number | null;
  depositAmount: number | null;
  remaining: number | null;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number | null;
  }>;
  isOwner: boolean;
  isAdmin: boolean;
};

export async function getPublicOrderByCode(
  rawCode: string
): Promise<PublicOrderView | null> {
  const code = normalizeOrderCode(rawCode);
  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true },
  });
  if (!order) return null;

  const session = await auth();
  const isOwner = Boolean(
    session?.user?.id && order.userId === session.user.id
  );
  const isAdmin = isAdminEmail(session?.user?.email);

  return {
    code: order.code,
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    contactDisplay:
      isOwner || isAdmin
        ? order.contactName
        : maskContactName(order.contactName),
    eventDate: order.eventDate?.toISOString().slice(0, 10) ?? null,
    eventType: order.eventType,
    guests: order.guests,
    comments: isOwner || isAdmin ? order.comments : null,
    deliveryMethod: order.deliveryMethod,
    shippingAddressDisplay:
      isOwner || isAdmin
        ? order.shippingAddress
        : maskShippingAddress(order.shippingAddress),
    shippingCost: toNumber(order.shippingCost),
    itemsTotal: toNumber(order.itemsTotal),
    discountAmount: toNumber(order.discountAmount),
    discountReason: order.discountReason,
    total: toNumber(order.total),
    depositAmount: toNumber(order.depositAmount),
    remaining: calcRemaining(order.total, order.depositAmount),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: toNumber(i.unitPrice),
    })),
    isOwner,
    isAdmin,
  };
}

export async function getAdminOrderByCode(rawCode: string) {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }

  const code = normalizeOrderCode(rawCode);
  const order = await prisma.order.findUnique({
    where: { code },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
      changeLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!order) return null;

  return {
    ...order,
    itemsTotal: toNumber(order.itemsTotal),
    total: toNumber(order.total),
    depositAmount: toNumber(order.depositAmount),
    shippingCost: toNumber(order.shippingCost),
    discountAmount: toNumber(order.discountAmount),
    remaining: calcRemaining(order.total, order.depositAmount),
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      categoryId: i.categoryId,
      categoryName: i.categoryName,
      quantity: i.quantity,
      unitPrice: toNumber(i.unitPrice),
    })),
    changeLogs: order.changeLogs.map((log) => ({
      id: log.id,
      adminEmail: log.adminEmail,
      summary: log.summary,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}
