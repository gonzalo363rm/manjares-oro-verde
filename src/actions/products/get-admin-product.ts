"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function getAdminProduct(id: string) {
  const gate = await requireAdmin();
  if (!gate.ok) return null;

  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}
