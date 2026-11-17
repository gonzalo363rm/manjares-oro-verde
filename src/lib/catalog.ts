import { unstable_cache } from "next/cache";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

/** Productos preview por categoría en la home (carrusel). */
export const HOME_CATEGORY_PREVIEW_COUNT = 8;

const CATALOG_REVALIDATE_SECONDS = 3600;

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

async function fetchHomeCategoryRails() {
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

async function fetchCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, active: true },
  });
}

export const getActiveCategories = cache(
  unstable_cache(fetchActiveCategories, ["active-categories"], {
    tags: ["catalog"],
    revalidate: CATALOG_REVALIDATE_SECONDS,
  })
);

export const getHomeCategoryRails = cache(
  unstable_cache(fetchHomeCategoryRails, ["home-category-rails"], {
    tags: ["catalog"],
    revalidate: CATALOG_REVALIDATE_SECONDS,
  })
);

export const getCatalogProducts = cache(async (categorySlug?: string) => {
  return unstable_cache(
    () => fetchCatalogProducts(categorySlug),
    ["catalog-products", categorySlug ?? "all"],
    {
      tags: ["catalog"],
      revalidate: CATALOG_REVALIDATE_SECONDS,
    }
  )();
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return unstable_cache(
    () => fetchCategoryBySlug(slug),
    ["category-by-slug", slug],
    {
      tags: ["catalog"],
      revalidate: CATALOG_REVALIDATE_SECONDS,
    }
  )();
});
