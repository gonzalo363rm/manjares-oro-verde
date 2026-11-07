import { z } from "zod";

export const updateMyContactSchema = z.object({
  contactName: z.string().trim().max(120).default(""),
  contactPhone: z.string().trim().max(40).default(""),
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
