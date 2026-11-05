import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

async function fetchActiveCategories() {
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
}

async function fetchCatalogProducts(categorySlug?: string) {
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
}

export const getActiveCategories = unstable_cache(
  fetchActiveCategories,
  ["active-categories"],
  { tags: ["catalog"], revalidate: 3600 }
);

export function getCatalogProducts(categorySlug?: string) {
  return unstable_cache(
    () => fetchCatalogProducts(categorySlug),
    ["catalog-products", categorySlug ?? "all"],
    { tags: ["catalog"], revalidate: 3600 }
  )();
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, active: true },
  });
}
