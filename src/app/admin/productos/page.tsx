import Link from "next/link";

import { listCategories } from "@/actions/categories";
import {
  listAdminProducts,
  setProductActiveFormAction,
} from "@/actions/products";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TextLink } from "@/components/ui/TextLink";
import { formatMoneyARS } from "@/lib/order-money";

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
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Sync</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category.name}</TableCell>
                  <TableCell>
                    {formatMoneyARS(p.price ? Number(p.price) : null)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "outline"}>
                      {p.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.metaSyncStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/productos/${p.id}`}>Editar</Link>
                      </Button>
                      <form
                        action={setProductActiveFormAction.bind(
                          null,
                          p.id,
                          !p.active
                        )}
                      >
                        <Button type="submit" variant="ghost" size="sm">
                          {p.active ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
