"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import {
  updateProductSchema,
  type UpdateProductInput,
} from "@/actions/products/schemas";
import { requireAdmin } from "@/lib/admin-guard";
import { catalogSync } from "@/lib/catalog-sync";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { isManjaresCloudinaryPublicId } from "@/lib/cloudinary-url";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function updateProduct(
  raw: UpdateProductInput
): Promise<ProductActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = updateProductSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const data = parsed.data;
  for (const img of data.images ?? []) {
    if (!isManjaresCloudinaryPublicId(img.publicId)) {
      return { ok: false, error: "Imagen inválida" };
    }
  }

  const existing = await prisma.product.findUnique({
    where: { id: data.id },
    include: { images: true },
  });
  if (!existing) return { ok: false, error: "Producto no encontrado" };

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) return { ok: false, error: "Categoría no encontrada" };

  let slug = existing.slug;
  if (data.name !== existing.name) {
    slug = await uniqueSlug(data.name, async (s) => {
      const found = await prisma.product.findFirst({
        where: { slug: s, NOT: { id: data.id } },
      });
      return Boolean(found);
    });
  }

  const nextImages = data.images ?? [];
  const nextPublicIds = new Set(nextImages.map((i) => i.publicId));
  const removed = existing.images.filter((i) => !nextPublicIds.has(i.publicId));

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: data.id } });
    await tx.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug,
        description: data.description ?? "",
        price:
          data.price == null ? null : new Decimal(data.price.toFixed(2)),
        unitNote: data.unitNote || null,
        categoryId: data.categoryId,
        active: data.active ?? true,
        retailerId: data.retailerId?.trim() || existing.retailerId,
        metaSyncStatus: "PENDING",
        images: {
          create: nextImages.map((img, index) => ({
            publicId: img.publicId,
            version: img.version,
            width: img.width,
            height: img.height,
            sortOrder: img.sortOrder ?? index,
            alt: img.alt || null,
          })),
        },
      },
    });
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${data.id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidateTag("catalog");

  after(async () => {
    await Promise.all(removed.map((img) => destroyCloudinaryAsset(img.publicId)));
    if (data.active === false) {
      await catalogSync.deactivateProduct(data.id);
    } else {
      await catalogSync.upsertProduct(data.id);
    }
  });

  return { ok: true, id: data.id };
}
