"use server";

import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-guard";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function deleteProduct(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { select: { publicId: true } },
      _count: { select: { orderItems: true } },
    },
  });
  if (!product) return { ok: false, error: "Producto no encontrado" };
  if (product._count.orderItems > 0) {
    return {
      ok: false,
      error: "No se puede borrar: ya apareció en pedidos. Desactivalo.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { productId: id } });
    await tx.review.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidateTag("catalog");

  const publicIds = product.images.map((img) => img.publicId);
  after(async () => {
    await Promise.all(publicIds.map((publicId) => destroyCloudinaryAsset(publicId)));
  });

  return { ok: true };
}

/** Form action wrapper (Next form actions must return void). */
export async function deleteProductFormAction(id: string) {
  await deleteProduct(id);
}
