"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(100),
});

export async function reorderPickupPoints(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Orden inválido" };

  const { orderedIds } = parsed.data;
  if (new Set(orderedIds).size !== orderedIds.length) {
    return { ok: false, error: "Orden inválido" };
  }

  const existing = await prisma.pickupPoint.findMany({
    where: { id: { in: orderedIds } },
    select: { id: true },
  });
  if (existing.length !== orderedIds.length) {
    return { ok: false, error: "Hay puntos inexistentes" };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.pickupPoint.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/admin/puntos-retiro");
  revalidatePath("/");
  revalidateTag("pickup-points");

  return { ok: true };
}
