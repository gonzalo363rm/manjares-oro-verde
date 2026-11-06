"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function listPickupPoints() {
  const gate = await requireAdmin();
  if (!gate.ok) return [];

  return prisma.pickupPoint.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
