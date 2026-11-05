"use server";

import type { OrderStatus } from "@prisma/client";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { calcRemaining, toNumber } from "@/lib/order-money";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export async function listMyOrders() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return orders.map((o) => ({
    code: o.code,
    status: o.status,
    statusLabel: ORDER_STATUS_LABELS[o.status],
    createdAt: o.createdAt.toISOString(),
    total: toNumber(o.total),
    remaining: calcRemaining(o.total, o.depositAmount),
    itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
  }));
}

export async function listAdminOrders(status?: OrderStatus | "ALL") {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return [];
  }

  const orders = await prisma.order.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
    },
  });

  return orders.map((o) => ({
    code: o.code,
    status: o.status,
    statusLabel: ORDER_STATUS_LABELS[o.status],
    contactName: o.contactName,
    contactPhone: o.contactPhone,
    createdAt: o.createdAt.toISOString(),
    total: toNumber(o.total),
    depositAmount: toNumber(o.depositAmount),
    remaining: calcRemaining(o.total, o.depositAmount),
    itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
    userEmail: o.user?.email ?? null,
  }));
}
