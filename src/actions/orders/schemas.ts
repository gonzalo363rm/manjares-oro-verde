import { z } from "zod";

export const createOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1),
  contactName: z.string().trim().min(2).max(120),
  contactPhone: z.string().trim().min(6).max(40),
  contactEmail: z
    .union([z.string().trim().email().max(160), z.literal(""), z.null()])
    .optional(),
  eventDate: z.string().optional().nullable(),
  eventType: z.string().trim().max(80).optional().nullable(),
  guests: z.number().int().min(1).max(10000).optional().nullable(),
  comments: z.string().trim().max(2000).optional().nullable(),
  cartHash: z.string().min(1).max(64),
  existingCode: z.string().optional().nullable(),
});

export const adminOrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional().nullable(),
  productName: z.string().trim().min(1).max(160),
  categoryId: z.string().uuid().optional().nullable(),
  categoryName: z.string().trim().max(120).optional().nullable(),
  quantity: z.number().int().min(1).max(999),
  unitPrice: z.number().min(0).optional().nullable(),
});

export const adminUpdateOrderSchema = z.object({
  code: z.string().min(3).max(32),
  status: z.enum([
    "PENDIENTE_CONFIRMACION",
    "EN_ESPERA_SENA",
    "EN_PREPARACION",
    "PENDIENTE_RETIRO",
    "PENDIENTE_ENVIO",
    "EN_CAMINO",
    "ENTREGADO",
    "CANCELADO",
  ]),
  deliveryMethod: z.enum(["RETIRO", "ENVIO"]).optional().nullable(),
  shippingAddress: z.string().trim().max(500).optional().nullable(),
  shippingCost: z.number().min(0).optional().nullable(),
  itemsTotal: z.number().min(0).optional().nullable(),
  total: z.number().min(0).optional().nullable(),
  depositAmount: z.number().min(0).optional().nullable(),
  discountAmount: z.number().min(0).optional().nullable(),
  discountReason: z.string().trim().max(200).optional().nullable(),
  totalOverride: z.boolean().optional().default(false),
  adminNotes: z.string().trim().max(2000).optional().nullable(),
  items: z.array(adminOrderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AdminUpdateOrderInput = z.infer<typeof adminUpdateOrderSchema>;
