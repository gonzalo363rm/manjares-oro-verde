import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE_CONFIRMACION: "Pendiente de confirmación",
  EN_ESPERA_SENA: "En espera de seña",
  EN_PREPARACION: "En preparación",
  PENDIENTE_RETIRO: "Pendiente de retiro",
  PENDIENTE_ENVIO: "Pendiente de envío",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_OPTIONS = (
  Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]
).map(([value, label]) => ({ value, label }));

/** Statuses that count as a sale for stats. */
export const SALE_STATUSES: OrderStatus[] = [
  "EN_ESPERA_SENA",
  "EN_PREPARACION",
  "PENDIENTE_RETIRO",
  "PENDIENTE_ENVIO",
  "EN_CAMINO",
  "ENTREGADO",
];

export function isSaleStatus(status: OrderStatus): boolean {
  return SALE_STATUSES.includes(status);
}
