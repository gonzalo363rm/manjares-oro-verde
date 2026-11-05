"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function countPendingOrders(): Promise<number> {
  const gate = await requireAdmin();
  if (!gate.ok) return 0;

  return prisma.order.count({
    where: { status: "PENDIENTE_CONFIRMACION" },
  });
}
