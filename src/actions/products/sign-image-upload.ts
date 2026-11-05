"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { signCloudinaryUpload } from "@/lib/cloudinary";
import {
  CLOUDINARY_CATEGORIES_FOLDER,
  CLOUDINARY_PRODUCTS_FOLDER,
  cloudinaryAssetName,
} from "@/lib/cloudinary-url";

const schema = z.object({
  folder: z
    .string()
    .regex(
      new RegExp(
        `^(${CLOUDINARY_CATEGORIES_FOLDER}|${CLOUDINARY_PRODUCTS_FOLDER})/[a-z0-9-_]+$`,
        "i"
      )
    ),
  kind: z.enum(["category", "product"]),
  index: z.number().int().min(0).max(20).optional(),
});

export async function signImageUpload(raw: {
  folder: string;
  kind: "category" | "product";
  index?: number;
}) {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false as const, error: gate.error };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Carpeta inválida" };
  }

  const { folder, kind, index } = parsed.data;
  if (
    kind === "category" &&
    !folder.startsWith(`${CLOUDINARY_CATEGORIES_FOLDER}/`)
  ) {
    return { ok: false as const, error: "Carpeta de categoría inválida" };
  }
  if (
    kind === "product" &&
    !folder.startsWith(`${CLOUDINARY_PRODUCTS_FOLDER}/`)
  ) {
    return { ok: false as const, error: "Carpeta de producto inválida" };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = cloudinaryAssetName({ kind, index });
    const signed = signCloudinaryUpload({
      folder,
      publicId,
      timestamp,
    });
    return { ok: true as const, ...signed };
  } catch (err) {
    console.error(err);
    return { ok: false as const, error: "Cloudinary no configurado" };
  }
}
