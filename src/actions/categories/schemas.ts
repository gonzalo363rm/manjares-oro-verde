import { z } from "zod";

export const categoryImageSchema = z
  .object({
    publicId: z.string().min(1).max(300),
    version: z.number().int().positive(),
  })
  .nullable()
  .optional();

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(""),
  active: z.boolean().optional().default(true),
  image: categoryImageSchema,
  hoverImage: categoryImageSchema,
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().uuid(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
