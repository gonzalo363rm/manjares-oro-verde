import Link from "next/link";

import {
  deleteCategoryFormAction,
  listCategories,
} from "@/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
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
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c._count.products}</TableCell>
                  <TableCell>{c.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={c.active ? "default" : "outline"}>
                      {c.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/categorias/${c.id}`}>Editar</Link>
                      </Button>
                      {c._count.products === 0 ? (
                        <form
                          action={deleteCategoryFormAction.bind(null, c.id)}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            Borrar
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">Nueva categoría</h2>
          <CategoryForm />
        </div>
      </div>
    </main>
  );
}
