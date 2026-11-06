"use server";

import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-guard";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function deleteCategory(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return { ok: false, error: "Categoría no encontrada" };
  if (category._count.products > 0) {
    return {
      ok: false,
      error: "No se puede borrar: tiene productos. Desactivala o movelos.",
    };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidateTag("catalog");

  after(async () => {
    if (category.imagePublicId) {
      await destroyCloudinaryAsset(category.imagePublicId);
    }
    if (category.hoverImagePublicId) {
      await destroyCloudinaryAsset(category.hoverImagePublicId);
    }
  });

  return { ok: true };
}

/** Form action wrapper (Next form actions must return void). */
export async function deleteCategoryFormAction(id: string) {
  await deleteCategory(id);
}
