"use server";

import { revalidatePath } from "next/cache";

import {
  updateMyContactSchema,
  type UpdateMyContactInput,
} from "@/actions/contact/schemas";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type UpdateMyContactResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateMyContact(
  raw: UpdateMyContactInput
): Promise<UpdateMyContactResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, error: "Tenés que iniciar sesión" };
  }

  const parsed = updateMyContactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Datos de contacto inválidos" };
  }

  const { contactName, contactPhone, contactEmail } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      contactName: contactName.trim() || null,
      contactPhone: contactPhone.trim() || null,
      contactEmail: contactEmail?.trim() || null,
    },
  });

  revalidatePath("/mis-datos");
  revalidatePath("/carrito");

  return { ok: true };
}
