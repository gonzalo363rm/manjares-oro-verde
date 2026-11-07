"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

import { ProductCard } from "@/components/catalog/ProductCard";

export type CatalogGridProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  unitNote: string | null;
  description?: string | null;
  images: { publicId: string; version: number }[];
  categorySlug: string;
};

type Props = {
  products: CatalogGridProduct[];
};

function CatalogProductGridInner({ products }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openSlug = searchParams.get("producto");

  const setOpenProduct = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) params.set("producto", slug);
      else params.delete("producto");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          slug={p.slug}
          price={p.price}
          unitNote={p.unitNote}
          description={p.description}
          images={p.images}
          categorySlug={p.categorySlug}
          open={openSlug === p.slug}
          onOpenChange={(next) => setOpenProduct(next ? p.slug : null)}
        />
      ))}
    </div>
  );
}

export function CatalogProductGrid({ products }: Props) {
  return (
    <Suspense
      fallback={
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              unitNote={p.unitNote}
              description={p.description}
              images={p.images}
              categorySlug={p.categorySlug}
            />
          ))}
        </div>
      }
    >
      <CatalogProductGridInner products={products} />
    </Suspense>
  );
}
