"use server";

import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from "@/actions/categories/schemas";
import { requireAdmin } from "@/lib/admin-guard";
import { catalogSync } from "@/lib/catalog-sync";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { isManjaresCloudinaryPublicId } from "@/lib/cloudinary-url";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

export type CategoryActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function updateCategory(
  raw: UpdateCategoryInput
): Promise<CategoryActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = updateCategorySchema.safeParse(raw);
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

  const existing = await prisma.category.findUnique({ where: { id: data.id } });
  if (!existing) return { ok: false, error: "Categoría no encontrada" };

  let slug = existing.slug;
  if (data.name !== existing.name) {
    slug = await uniqueSlug(data.name, async (s) => {
      const found = await prisma.category.findFirst({
        where: { slug: s, NOT: { id: data.id } },
      });
      return Boolean(found);
    });
  }

  const oldPublicId = existing.imagePublicId;
  const oldHoverPublicId = existing.hoverImagePublicId;
  const nextPublicId = data.image?.publicId ?? null;
  const nextVersion = data.image?.version ?? null;
  const nextHoverPublicId = data.hoverImage?.publicId ?? null;
  const nextHoverVersion = data.hoverImage?.version ?? null;

  await prisma.category.update({
    where: { id: data.id },
    data: {
      name: data.name,
      slug,
      description: data.description ?? "",
      active: data.active ?? true,
      showOnHome: data.showOnHome ?? true,
      imagePublicId: nextPublicId,
      imageVersion: nextVersion,
      hoverImagePublicId: nextHoverPublicId,
      hoverImageVersion: nextHoverVersion,
    },
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/${slug}`);
  revalidateTag("catalog");

  after(async () => {
    if (oldPublicId && oldPublicId !== nextPublicId) {
      await destroyCloudinaryAsset(oldPublicId);
    }
    if (oldHoverPublicId && oldHoverPublicId !== nextHoverPublicId) {
      await destroyCloudinaryAsset(oldHoverPublicId);
    }
    await catalogSync.upsertCategory(data.id);
  });

  return { ok: true, id: data.id };
}
