"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function deletePickupPoint(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const existing = await prisma.pickupPoint.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Punto no encontrado" };

  await prisma.pickupPoint.delete({ where: { id } });

  revalidatePath("/admin/puntos-retiro");
  revalidatePath("/");
  revalidateTag("pickup-points");

  return { ok: true };
}

export async function deletePickupPointFormAction(id: string) {
  await deletePickupPoint(id);
}
