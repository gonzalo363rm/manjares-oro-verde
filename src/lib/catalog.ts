import { cache } from "react";

import { prisma } from "@/lib/prisma";

/** Productos preview por categoría en la home (carrusel). */
export const HOME_CATEGORY_PREVIEW_COUNT = 8;

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

export const getHomeCategoryRails = cache(async () => {
  return prisma.category.findMany({
    where: {
      active: true,
      showOnHome: true,
      products: { some: { active: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      products: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: HOME_CATEGORY_PREVIEW_COUNT,
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 2,
            select: { publicId: true, version: true },
          },
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
