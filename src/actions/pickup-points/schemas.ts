import { z } from "zod";

import { normalizeGoogleMapsEmbedUrl } from "@/lib/google-maps-embed";

const mapEmbedUrlSchema = z
  .string()
  .trim()
  .min(1, "Pegá el iframe o la URL de Google Maps")
  .max(4000)
  .refine((value) => Boolean(normalizeGoogleMapsEmbedUrl(value)), {
    message:
      "Usá un embed de Google Maps (Compartir → Insertar un mapa) o una URL maps.google.com",
  })
  .transform((value) => normalizeGoogleMapsEmbedUrl(value)!);

export const createPickupPointSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  mapEmbedUrl: mapEmbedUrlSchema,
  active: z.boolean().optional().default(true),
});

export const updatePickupPointSchema = createPickupPointSchema.extend({
  id: z.string().uuid(),
});

export type CreatePickupPointInput = z.infer<typeof createPickupPointSchema>;
export type UpdatePickupPointInput = z.infer<typeof updatePickupPointSchema>;
