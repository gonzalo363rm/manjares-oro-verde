import { notFound } from "next/navigation";

import { listCategories } from "@/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextLink } from "@/components/ui/TextLink";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Editar categoría | Admin",
  robots: { index: false, follow: false },
};

export default async function EditarCategoriaPage({ params }: Props) {
  const { id } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <TextLink href="/admin/categorias" icon="back">
        Categorías
      </TextLink>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Editar categoría</h1>
      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm
            initial={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              sortOrder: category.sortOrder,
              active: category.active,
              imagePublicId: category.imagePublicId,
              imageVersion: category.imageVersion,
              hoverImagePublicId: category.hoverImagePublicId,
              hoverImageVersion: category.hoverImageVersion,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
