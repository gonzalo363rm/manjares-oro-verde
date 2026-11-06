import type { Metadata } from "next";

import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { ProductCard } from "@/components/catalog/ProductCard";
import { TextLink } from "@/components/ui/TextLink";
import { getActiveCategories, getCatalogProducts } from "@/lib/catalog";
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
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getCatalogProducts(),
  ]);

  const tabs = [
    { href: "/catalogo", label: "Todos", active: true },
    ...categories.map((c) => ({
      href: `/catalogo/${c.slug}`,
      label: c.name,
      active: false,
    })),
  ];

  return (
    <div className="page-gutter space-y-6 py-8">
      <header>
        <TextLink href="/" icon="back">
          Inicio
        </TextLink>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">Catálogo</h1>
        <p className="mt-1 text-sm text-stone-600">
          Elegí productos para tu evento
        </p>
      </header>
      <CategoryTabs tabs={tabs} />
      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
          Todavía no hay productos publicados.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={toNumber(p.price)}
              unitNote={p.unitNote}
              description={p.description}
              images={p.images}
            />
          ))}
        </div>
      )}
    </div>
  );
}
