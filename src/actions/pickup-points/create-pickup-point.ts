"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  createPickupPointSchema,
  type CreatePickupPointInput,
} from "@/actions/pickup-points/schemas";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export type PickupPointActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createPickupPoint(
  raw: CreatePickupPointInput
): Promise<PickupPointActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = createPickupPointSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const data = parsed.data;
  const maxOrder = await prisma.pickupPoint.aggregate({
    _max: { sortOrder: true },
  });

  const point = await prisma.pickupPoint.create({
    data: {
      name: data.name,
      address: data.address ?? "",
      description: data.description ?? "",
      mapEmbedUrl: data.mapEmbedUrl,
      active: data.active ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/puntos-retiro");
  revalidatePath("/");
  revalidateTag("pickup-points");

  return { ok: true, id: point.id };
}
