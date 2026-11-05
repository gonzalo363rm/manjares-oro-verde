import { z } from "zod";

export const updateMyContactSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(6).max(40),
  contactEmail: z
    .string()
    .trim()
    .max(160)
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Email inválido"
    )
    .optional(),
});

export type UpdateMyContactInput = z.infer<typeof updateMyContactSchema>;

export type MyContact = {
  name: string;
  phone: string;
  email: string;
};
