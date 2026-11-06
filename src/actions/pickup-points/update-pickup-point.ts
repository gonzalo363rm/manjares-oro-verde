"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  updatePickupPointSchema,
  type UpdatePickupPointInput,
} from "@/actions/pickup-points/schemas";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

import type { PickupPointActionResult } from "./create-pickup-point";

export async function updatePickupPoint(
  raw: UpdatePickupPointInput
): Promise<PickupPointActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = updatePickupPointSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const data = parsed.data;
  const existing = await prisma.pickupPoint.findUnique({
    where: { id: data.id },
  });
  if (!existing) return { ok: false, error: "Punto no encontrado" };

  await prisma.pickupPoint.update({
    where: { id: data.id },
    data: {
      name: data.name,
      address: data.address ?? "",
      description: data.description ?? "",
      mapEmbedUrl: data.mapEmbedUrl,
      active: data.active ?? true,
    },
  });

  revalidatePath("/admin/puntos-retiro");
  revalidatePath(`/admin/puntos-retiro/${data.id}`);
  revalidatePath("/");
  revalidateTag("pickup-points");

  return { ok: true, id: data.id };
}
