import { notFound } from "next/navigation";

import { listCategories } from "@/actions/categories";
import { getAdminProduct } from "@/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextLink } from "@/components/ui/TextLink";
import { toNumber } from "@/lib/order-money";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Editar producto | Admin",
  robots: { index: false, follow: false },
};

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listCategories(),
  ]);
  if (!product) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <TextLink href="/admin/productos" icon="back">
        Productos
      </TextLink>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Editar producto</h1>
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            }))}
            initial={{
              id: product.id,
              name: product.name,
              description: product.description,
              price: toNumber(product.price),
              unitNote: product.unitNote,
              categoryId: product.categoryId,
              sortOrder: product.sortOrder,
              active: product.active,
              retailerId: product.retailerId,
              images: product.images.map((img) => ({
                publicId: img.publicId,
                version: img.version,
                width: img.width,
                height: img.height,
                sortOrder: img.sortOrder,
                alt: img.alt,
              })),
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
