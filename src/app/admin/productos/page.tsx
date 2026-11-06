import Link from "next/link";

import { listCategories } from "@/actions/categories";
import { listAdminProducts } from "@/actions/products";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import { AdminProductsSortableList } from "@/components/admin/AdminProductsSortableList";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/TextLink";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin productos | Manjares",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ categoryId?: string; active?: string }>;
};

export default async function AdminProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const active =
    params.active === "ACTIVE" || params.active === "INACTIVE"
      ? params.active
      : "ALL";
  const [products, categories] = await Promise.all([
    listAdminProducts({
      categoryId: params.categoryId,
      active,
    }),
    listCategories(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <TextLink href="/admin" icon="back">
            Admin
          </TextLink>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Productos</h1>
        </div>
        <Button asChild>
          <Link href="/admin/productos/nuevo">Nuevo producto</Link>
        </Button>
      </div>

      <AdminProductFilters
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        categoryId={params.categoryId}
        active={active}
      />

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No hay productos con ese filtro.
        </p>
      ) : (
        <AdminProductsSortableList
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            categoryName: p.category.name,
            price: p.price ? Number(p.price) : null,
            active: p.active,
            metaSyncStatus: p.metaSyncStatus,
            canDelete: p._count.orderItems === 0,
            thumb: p.images[0]
              ? {
                  publicId: p.images[0].publicId,
                  version: p.images[0].version,
                }
              : null,
          }))}
        />
      )}
    </main>
  );
}
