"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function listAdminProducts(filters?: {
  categoryId?: string;
  active?: "ALL" | "ACTIVE" | "INACTIVE";
}) {
  const gate = await requireAdmin();
  if (!gate.ok) return [];

  const active =
    filters?.active === "ACTIVE"
      ? true
      : filters?.active === "INACTIVE"
        ? false
        : undefined;

  return prisma.product.findMany({
    where: {
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(active === undefined ? {} : { active }),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });
}
