import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/ProductCard";
import { getCatalogProducts, getCategoryBySlug } from "@/lib/catalog";
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
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getCatalogProducts(slug),
  ]);

  if (!category) notFound();

  return (
    <>
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
    </>
  );
}
