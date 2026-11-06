"use server";

import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/actions/categories/schemas";
import { requireAdmin } from "@/lib/admin-guard";
import { catalogSync } from "@/lib/catalog-sync";
import { isManjaresCloudinaryPublicId } from "@/lib/cloudinary-url";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

export type CategoryActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createCategory(
  raw: CreateCategoryInput
): Promise<CategoryActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const data = parsed.data;
  if (data.image?.publicId && !isManjaresCloudinaryPublicId(data.image.publicId)) {
    return { ok: false, error: "Imagen inválida" };
  }
  if (
    data.hoverImage?.publicId &&
    !isManjaresCloudinaryPublicId(data.hoverImage.publicId)
  ) {
    return { ok: false, error: "Imagen de hover inválida" };
  }

  const slug = await uniqueSlug(data.name, async (s) => {
    const found = await prisma.category.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const maxOrder = await prisma.category.aggregate({
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? "",
      sortOrder,
      active: data.active ?? true,
      imagePublicId: data.image?.publicId ?? null,
      imageVersion: data.image?.version ?? null,
      hoverImagePublicId: data.hoverImage?.publicId ?? null,
      hoverImageVersion: data.hoverImage?.version ?? null,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidateTag("catalog");

  after(async () => {
    await catalogSync.upsertCategory(category.id);
  });

  return { ok: true, id: category.id };
}
