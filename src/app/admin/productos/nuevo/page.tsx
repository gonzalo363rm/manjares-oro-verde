import { listCategories } from "@/actions/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextLink } from "@/components/ui/TextLink";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nuevo producto | Admin",
  robots: { index: false, follow: false },
};

export default async function NuevoProductoPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <TextLink href="/admin/productos" icon="back">
        Productos
      </TextLink>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Nuevo producto</h1>
      {categories.length === 0 ? (
        <p className="text-sm text-stone-600">
          Primero creá una{" "}
          <TextLink href="/admin/categorias">categoría</TextLink>.
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Datos del producto</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
              }))}
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
