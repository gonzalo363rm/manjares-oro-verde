"use server";

import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-guard";
import { catalogSync } from "@/lib/catalog-sync";
import { prisma } from "@/lib/prisma";

export async function setProductActive(
  id: string,
  active: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { ok: false, error: "Producto no encontrado" };

  await prisma.product.update({
    where: { id },
    data: {
      active,
      metaSyncStatus: "PENDING",
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidateTag("catalog");

  after(async () => {
    if (active) await catalogSync.upsertProduct(id);
    else await catalogSync.deactivateProduct(id);
  });

  return { ok: true };
}

/** Form action wrapper (Next form actions must return void). */
export async function setProductActiveFormAction(id: string, active: boolean) {
  await setProductActive(id, active);
}
