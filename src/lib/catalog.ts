import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getActiveCategories = cache(async () => {
  return prisma.category.findMany({
    where: {
      active: true,
      products: { some: { active: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 1,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  });
});

export const getCatalogProducts = cache(async (categorySlug?: string) => {
  return prisma.product.findMany({
    where: {
      active: true,
      ...(categorySlug
        ? { category: { slug: categorySlug, active: true } }
        : { category: { active: true } }),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 6 },
    },
  });
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findFirst({
    where: { slug, active: true },
  });
});
