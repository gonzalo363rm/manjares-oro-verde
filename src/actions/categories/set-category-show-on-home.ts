"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function setCategoryShowOnHome(
  id: string,
  showOnHome: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return { ok: false, error: "Categoría no encontrada" };

  await prisma.category.update({
    where: { id },
    data: { showOnHome },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidateTag("catalog");

  return { ok: true };
}
