import { z } from "zod";

export const productImageInputSchema = z.object({
  publicId: z.string().min(1).max(300),
  version: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sortOrder: z.number().int().min(0).max(99).optional().default(0),
  alt: z.string().trim().max(200).optional().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(4000).optional().default(""),
  price: z.number().min(0).optional().nullable(),
  unitNote: z.string().trim().max(40).optional().nullable(),
  categoryId: z.string().uuid(),
  active: z.boolean().optional().default(true),
  retailerId: z.string().trim().max(80).optional().nullable(),
  images: z.array(productImageInputSchema).max(10).optional().default([]),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductImageInput = z.infer<typeof productImageInputSchema>;
