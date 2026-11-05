import type { Decimal } from "@prisma/client/runtime/library";

export type MoneyLike = Decimal | number | string | null | undefined;

export function toNumber(value: MoneyLike): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : null;
}

/** remaining = total - depositAmount (never persisted). */
export function calcRemaining(
  total: MoneyLike,
  depositAmount: MoneyLike
): number | null {
  const t = toNumber(total);
  if (t === null) return null;
  const d = toNumber(depositAmount) ?? 0;
  return Math.max(0, Math.round((t - d) * 100) / 100);
}

export function formatMoneyARS(value: MoneyLike): string {
  const n = toNumber(value);
  if (n === null) return "Consultar";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(n);
}

export function sumItemsTotal(
  items: Array<{ quantity: number; unitPrice: MoneyLike }>
): number | null {
  let anyPriced = false;
  let sum = 0;
  for (const item of items) {
    const price = toNumber(item.unitPrice);
    if (price === null) continue;
    anyPriced = true;
    sum += price * item.quantity;
  }
  if (!anyPriced) return null;
  return Math.round(sum * 100) / 100;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Percent of discount over itemsTotal (0–100), or null if not computable. */
export function discountPercent(
  discountAmount: MoneyLike,
  itemsTotal: MoneyLike
): number | null {
  const discount = toNumber(discountAmount);
  const items = toNumber(itemsTotal);
  if (discount == null || discount <= 0 || items == null || items <= 0) {
    return null;
  }
  return roundMoney((discount / items) * 100);
}

/** total = itemsTotal + shipping - discount (unless override). */
export function calcOrderTotal(input: {
  itemsTotal: MoneyLike;
  shippingCost?: MoneyLike;
  discountAmount?: MoneyLike;
  totalOverride?: boolean;
  overrideTotal?: MoneyLike;
}): number | null {
  if (input.totalOverride) {
    return toNumber(input.overrideTotal);
  }
  const items = toNumber(input.itemsTotal);
  if (items === null) return null;
  const shipping = toNumber(input.shippingCost) ?? 0;
  const discount = Math.min(toNumber(input.discountAmount) ?? 0, items);
  return roundMoney(items + shipping - discount);
}
