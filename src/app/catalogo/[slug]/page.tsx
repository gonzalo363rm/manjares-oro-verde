import { notFound } from "next/navigation";

import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { ProductCard } from "@/components/catalog/ProductCard";
import { TextLink } from "@/components/ui/TextLink";
import {
  getActiveCategories,
  getCatalogProducts,
  getCategoryBySlug,
} from "@/lib/catalog";
import { toNumber } from "@/lib/order-money";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catálogo" };
  return {
    title: `${category.name} | Catálogo`,
    description:
      category.description?.trim() ||
      `Productos de ${category.name} en Manjares de Oro Verde. Pedí por WhatsApp.`,
    alternates: { canonical: `/catalogo/${slug}` },
  };
}

export default async function CatalogoCategoriaPage({ params }: Props) {
  const { slug } = await params;
  const [category, categories, products] = await Promise.all([
    getCategoryBySlug(slug),
    getActiveCategories(),
    getCatalogProducts(slug),
  ]);

  if (!category) notFound();

  const tabs = [
    { href: "/catalogo", label: "Todos", active: false },
    ...categories.map((c) => ({
      href: `/catalogo/${c.slug}`,
      label: c.name,
      active: c.slug === slug,
    })),
  ];

  return (
    <div className="page-gutter space-y-6 py-8">
      <header>
        <TextLink href="/catalogo" icon="back">
          Catálogo
        </TextLink>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">{category.name}</h1>
        {category.description ? (
          <p className="mt-1 text-sm text-stone-600">{category.description}</p>
        ) : null}
      </header>
      <CategoryTabs tabs={tabs} />
      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
          No hay productos en esta categoría.
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
