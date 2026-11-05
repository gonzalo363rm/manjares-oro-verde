"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import {
  createProductSchema,
  type CreateProductInput,
} from "@/actions/products/schemas";
import { requireAdmin } from "@/lib/admin-guard";
import { catalogSync } from "@/lib/catalog-sync";
import { isManjaresCloudinaryPublicId } from "@/lib/cloudinary-url";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createProduct(
  raw: CreateProductInput
): Promise<ProductActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = createProductSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const data = parsed.data;
  for (const img of data.images ?? []) {
    if (!isManjaresCloudinaryPublicId(img.publicId)) {
      return { ok: false, error: "Imagen inválida" };
    }
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) return { ok: false, error: "Categoría no encontrada" };

  const slug = await uniqueSlug(data.name, async (s) => {
    const found = await prisma.product.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const retailerId =
    data.retailerId?.trim() ||
    (await uniqueSlug(data.name, async (s) => {
      const found = await prisma.product.findUnique({
        where: { retailerId: s },
      });
      return Boolean(found);
    }));

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? "",
      price:
        data.price == null ? null : new Decimal(data.price.toFixed(2)),
      unitNote: data.unitNote || null,
      categoryId: data.categoryId,
      sortOrder: data.sortOrder ?? 0,
      active: data.active ?? true,
      retailerId,
      metaSyncStatus: "PENDING",
      images: {
        create: (data.images ?? []).map((img, index) => ({
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

  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidateTag("catalog");

  after(async () => {
    await catalogSync.upsertProduct(product.id);
  });

  return { ok: true, id: product.id };
}
