"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CatalogLoadingFallback } from "@/components/catalog/CatalogLoadingFallback";
import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { TextLink } from "@/components/ui/TextLink";

export type CatalogFrameCategory = {
  slug: string;
  name: string;
  description: string | null;
};

type Props = {
  categories: CatalogFrameCategory[];
  children: ReactNode;
};

function slugFromCatalogPath(path: string): string | null {
  if (!path.startsWith("/catalogo/")) return null;
  return path.slice("/catalogo/".length).split("/")[0] || null;
}

export function CatalogFrame({ categories, children }: Props) {
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const displayPath = optimisticPath ?? pathname;
  const isNavigating =
    optimisticPath != null && optimisticPath !== pathname;

  const slug = slugFromCatalogPath(displayPath);
  const category = slug
    ? (categories.find((c) => c.slug === slug) ?? null)
    : null;
  const isAll = !slug;

  const tabs = [
    { href: "/catalogo", label: "Todos", active: isAll },
    ...categories.map((c) => ({
      href: `/catalogo/${c.slug}`,
      label: c.name,
      active: c.slug === slug,
    })),
  ];

  return (
    <div className="page-gutter space-y-6 py-8">
      <header>
        {isAll ? (
          <>
            <TextLink href="/" icon="back">
              Inicio
            </TextLink>
            <h1 className="mt-2 text-3xl font-bold text-stone-900">Catálogo</h1>
            <p className="mt-1 text-sm text-stone-600">
              Elegí productos para tu evento
            </p>
          </>
        ) : (
          <>
            <TextLink
              href="/catalogo"
              icon="back"
              onClick={() => setOptimisticPath("/catalogo")}
            >
              Catálogo
            </TextLink>
            <h1 className="mt-2 text-3xl font-bold text-stone-900">
              {category?.name ?? "Categoría"}
            </h1>
            {category?.description ? (
              <p className="mt-1 text-sm text-stone-600">
                {category.description}
              </p>
            ) : null}
          </>
        )}
      </header>
      <CategoryTabs tabs={tabs} onNavigate={setOptimisticPath} />
      {isNavigating ? <CatalogLoadingFallback /> : children}
    </div>
  );
}
