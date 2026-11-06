"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(200),
});

export async function reorderCategories(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Orden inválido" };

  const { orderedIds } = parsed.data;
  const unique = new Set(orderedIds);
  if (unique.size !== orderedIds.length) {
    return { ok: false, error: "Orden inválido" };
  }

  const existing = await prisma.category.findMany({
    where: { id: { in: orderedIds } },
    select: { id: true },
  });
  if (existing.length !== orderedIds.length) {
    return { ok: false, error: "Hay categorías inexistentes" };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidateTag("catalog");

  return { ok: true };
}
