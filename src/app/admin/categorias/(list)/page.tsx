import { listCategories } from "@/actions/categories";
import { AdminCategoriesSortableList } from "@/components/admin/AdminCategoriesSortableList";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { TextLink } from "@/components/ui/TextLink";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin categorías | Manjares",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriasPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <TextLink href="/admin" icon="back">
        Admin
      </TextLink>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Categorías</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <AdminCategoriesSortableList
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            active: c.active,
            productCount: c._count.products,
          }))}
        />

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">Nueva categoría</h2>
          <CategoryForm />
        </div>
      </div>
    </main>
  );
}
