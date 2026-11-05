"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createProduct,
  updateProduct,
  type ProductImageInput,
} from "@/actions/products";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cloudinaryFolderForProduct } from "@/lib/cloudinary-url";

type CategoryOption = { id: string; name: string; slug: string };

type Props = {
  categories: CategoryOption[];
  initial?: {
    id: string;
    name: string;
    description: string;
    price: number | null;
    unitNote: string | null;
    categoryId: string;
    sortOrder: number;
    active: boolean;
    retailerId: string | null;
    images: UploadedImage[];
  };
};

export function ProductForm({ categories, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial?.price != null ? String(initial.price) : ""
  );
  const [unitNote, setUnitNote] = useState(initial?.unitNote ?? "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? ""
  );
  const [sortOrder, setSortOrder] = useState(
    String(initial?.sortOrder ?? 0)
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [retailerId, setRetailerId] = useState(initial?.retailerId ?? "");
  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? []);
  const [uploadKey] = useState(
    () => initial?.id ?? `draft-${crypto.randomUUID().slice(0, 8)}`
  );

  const folder = cloudinaryFolderForProduct(uploadKey);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      description,
      price: price === "" ? null : Number(price),
      unitNote: unitNote || null,
      categoryId,
      sortOrder: Number(sortOrder) || 0,
      active,
      retailerId: retailerId || null,
      images: images as ProductImageInput[],
    };

    startTransition(async () => {
      const result = initial
        ? await updateProduct({ ...payload, id: initial.id })
        : await createProduct(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Elegí categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Precio (vacío = Consultar)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitNote">Nota de unidad</Label>
          <Input
            id="unitNote"
            placeholder="x12, por docena…"
            value={unitNote}
            onChange={(e) => setUnitNote(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Orden</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retailerId">SKU / retailerId (Meta)</Label>
          <Input
            id="retailerId"
            value={retailerId}
            onChange={(e) => setRetailerId(e.target.value)}
            placeholder="Se genera del nombre si queda vacío"
          />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch
            id="product-active"
            checked={active}
            onCheckedChange={setActive}
          />
          <Label htmlFor="product-active">Activo en el catálogo</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Imágenes</Label>
        <ImageUploader
          folder={folder}
          kind="product"
          value={images}
          onChange={setImages}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending || !categoryId}>
        {pending ? (
          <>
            <Spinner />
            Guardando…
          </>
        ) : initial ? (
          "Guardar cambios"
        ) : (
          "Crear producto"
        )}
      </Button>
    </form>
  );
}
