import { z } from "zod";

export const guestCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
});

export const mergeGuestCartSchema = z.object({
  items: z.array(guestCartItemSchema).max(100),
});

export const setCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(0).max(999),
});

export type MergeGuestCartInput = z.infer<typeof mergeGuestCartSchema>;
export type SetCartItemInput = z.infer<typeof setCartItemSchema>;
