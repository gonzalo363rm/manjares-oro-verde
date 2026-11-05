import type { Prisma } from "@prisma/client";

import { SALE_STATUSES } from "@/lib/order-status";
import { roundMoney, toNumber } from "@/lib/order-money";
import { prisma } from "@/lib/prisma";

export { SALE_STATUSES };

type Range = {
  from: Date;
  to: Date;
  categoryId?: string;
  productId?: string;
};

function saleWhere(range: Range): Prisma.OrderWhereInput {
  return {
    confirmedAt: { gte: range.from, lte: range.to },
    status: { in: SALE_STATUSES },
  };
}

/** Distribute order-level discount/override across items by gross weight. */
function allocateNet(
  items: Array<{
    productId: string | null;
    categoryId: string | null;
    quantity: number;
    unitPrice: number | null;
  }>,
  order: {
    itemsTotal: number | null;
    total: number | null;
    shippingCost: number | null;
    discountAmount: number | null;
    totalOverride: boolean;
  }
) {
  const rows = items.map((i) => {
    const unit = i.unitPrice ?? 0;
    const gross = roundMoney(unit * i.quantity);
    return { ...i, gross, net: gross };
  });
  const grossSum = roundMoney(rows.reduce((a, r) => a + r.gross, 0));
  if (grossSum <= 0) return rows;

  const shipping = order.shippingCost ?? 0;
  let itemsNet = order.itemsTotal ?? grossSum;
  if (order.totalOverride && order.total != null) {
    itemsNet = Math.max(0, roundMoney(order.total - shipping));
  } else if (order.discountAmount) {
    itemsNet = Math.max(0, roundMoney(grossSum - order.discountAmount));
  }

  return rows.map((r) => ({
    productId: r.productId,
    categoryId: r.categoryId,
    quantity: r.quantity,
    gross: r.gross,
    net: roundMoney((r.gross / grossSum) * itemsNet),
  }));
}

export async function getSalesByProduct(range: Range) {
  const orders = await prisma.order.findMany({
    where: saleWhere(range),
    include: {
      items: {
        where: range.categoryId
          ? { categoryId: range.categoryId }
          : range.productId
            ? { productId: range.productId }
            : undefined,
      },
    },
  });

  const map = new Map<
    string,
    {
      productId: string | null;
      productName: string;
      units: number;
      orders: number;
      gross: number;
      net: number;
    }
  >();

  for (const order of orders) {
    const allocated = allocateNet(
      order.items.map((i) => ({
        productId: i.productId,
        categoryId: i.categoryId,
        quantity: i.quantity,
        unitPrice: toNumber(i.unitPrice),
      })),
      {
        itemsTotal: toNumber(order.itemsTotal),
        total: toNumber(order.total),
        shippingCost: toNumber(order.shippingCost),
        discountAmount: toNumber(order.discountAmount),
        totalOverride: order.totalOverride,
      }
    );

    const seen = new Set<string>();
    for (let idx = 0; idx < order.items.length; idx++) {
      const item = order.items[idx];
      const row = allocated[idx];
      const key = item.productId ?? `name:${item.productName}`;
      const prev = map.get(key) ?? {
        productId: item.productId,
        productName: item.productName,
        units: 0,
        orders: 0,
        gross: 0,
        net: 0,
      };
      prev.units += item.quantity;
      prev.gross = roundMoney(prev.gross + row.gross);
      prev.net = roundMoney(prev.net + row.net);
      if (!seen.has(key)) {
        prev.orders += 1;
        seen.add(key);
      }
      map.set(key, prev);
    }
  }

  return [...map.values()].sort((a, b) => b.units - a.units);
}

export async function getSalesByCategory(range: Range) {
  const orders = await prisma.order.findMany({
    where: saleWhere(range),
    include: { items: true },
  });

  const map = new Map<
    string,
    {
      categoryId: string | null;
      categoryName: string;
      units: number;
      orders: number;
      gross: number;
      net: number;
    }
  >();

  for (const order of orders) {
    const allocated = allocateNet(
      order.items.map((i) => ({
        productId: i.productId,
        categoryId: i.categoryId,
        quantity: i.quantity,
        unitPrice: toNumber(i.unitPrice),
      })),
      {
        itemsTotal: toNumber(order.itemsTotal),
        total: toNumber(order.total),
        shippingCost: toNumber(order.shippingCost),
        discountAmount: toNumber(order.discountAmount),
        totalOverride: order.totalOverride,
      }
    );
    const seen = new Set<string>();
    for (let idx = 0; idx < order.items.length; idx++) {
      const item = order.items[idx];
      const row = allocated[idx];
      const key =
        item.categoryId ?? `name:${item.categoryName ?? "Sin categoría"}`;
      const prev = map.get(key) ?? {
        categoryId: item.categoryId,
        categoryName: item.categoryName ?? "Sin categoría",
        units: 0,
        orders: 0,
        gross: 0,
        net: 0,
      };
      prev.units += item.quantity;
      prev.gross = roundMoney(prev.gross + row.gross);
      prev.net = roundMoney(prev.net + row.net);
      if (!seen.has(key)) {
        prev.orders += 1;
        seen.add(key);
      }
      map.set(key, prev);
    }
  }

  return [...map.values()].sort((a, b) => b.units - a.units);
}

function bucketKey(date: Date, granularity: "day" | "week" | "month"): string {
  const d = new Date(date);
  if (granularity === "month") {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  if (granularity === "week") {
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - day + 1);
    return d.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

export async function getSalesSeries(range: {
  from: Date;
  to: Date;
  granularity: "day" | "week" | "month";
  productId?: string;
  categoryId?: string;
}) {
  const byProduct = await getSalesByProduct({
    from: range.from,
    to: range.to,
    productId: range.productId,
    categoryId: range.categoryId,
  });
  void byProduct;

  const orders = await prisma.order.findMany({
    where: saleWhere(range),
    include: {
      items: {
        where: range.categoryId
          ? { categoryId: range.categoryId }
          : range.productId
            ? { productId: range.productId }
            : undefined,
      },
    },
  });

  const map = new Map<string, { bucket: string; units: number; net: number }>();

  for (const order of orders) {
    if (!order.confirmedAt) continue;
    const key = bucketKey(order.confirmedAt, range.granularity);
    const allocated = allocateNet(
      order.items.map((i) => ({
        productId: i.productId,
        categoryId: i.categoryId,
        quantity: i.quantity,
        unitPrice: toNumber(i.unitPrice),
      })),
      {
        itemsTotal: toNumber(order.itemsTotal),
        total: toNumber(order.total),
        shippingCost: toNumber(order.shippingCost),
        discountAmount: toNumber(order.discountAmount),
        totalOverride: order.totalOverride,
      }
    );
    const prev = map.get(key) ?? { bucket: key, units: 0, net: 0 };
    for (const row of allocated) {
      prev.units += row.quantity;
      prev.net = roundMoney(prev.net + row.net);
    }
    map.set(key, prev);
  }

  return [...map.values()].sort((a, b) => a.bucket.localeCompare(b.bucket));
}
