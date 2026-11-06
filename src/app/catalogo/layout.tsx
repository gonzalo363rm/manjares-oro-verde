import { CatalogFrame } from "@/components/catalog/CatalogFrame";
import { getActiveCategories } from "@/lib/catalog";

export default async function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getActiveCategories();

  return (
    <CatalogFrame
      categories={categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
      }))}
    >
      {children}
    </CatalogFrame>
  );
}
