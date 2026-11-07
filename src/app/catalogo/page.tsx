import type { Metadata } from "next";

import { CatalogProductGrid } from "@/components/catalog/CatalogProductGrid";
import { getCatalogProducts } from "@/lib/catalog";
import { toNumber } from "@/lib/order-money";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Catálogo | ${SITE_NAME}`,
  description:
    "Explorá el catálogo de mesas dulces y productos de Manjares de Oro Verde. Sumá al carrito y pedí por WhatsApp.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogoPage() {
  const products = await getCatalogProducts();

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
        Todavía no hay productos publicados.
      </p>
    );
  }

  return (
    <CatalogProductGrid
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: toNumber(p.price),
        unitNote: p.unitNote,
        description: p.description,
        images: p.images,
        categorySlug: p.category.slug,
      }))}
    />
  );
}
