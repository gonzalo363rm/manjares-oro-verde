"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createCategory, updateCategory } from "@/actions/categories";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cloudinaryFolderForCategory } from "@/lib/cloudinary-url";
import { slugify } from "@/lib/slugify";

type Props = {
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    active: boolean;
    imagePublicId: string | null;
    imageVersion: number | null;
    hoverImagePublicId?: string | null;
    hoverImageVersion?: number | null;
  };
};

function imagesFromInitial(initial?: Props["initial"]): UploadedImage[] {
  if (!initial) return [];
  const list: UploadedImage[] = [];
  if (initial.imagePublicId && initial.imageVersion) {
    list.push({
      publicId: initial.imagePublicId,
      version: initial.imageVersion,
      width: 1200,
      height: 800,
      sortOrder: 0,
    });
  }
  if (initial.hoverImagePublicId && initial.hoverImageVersion) {
    list.push({
      publicId: initial.hoverImagePublicId,
      version: initial.hoverImageVersion,
      width: 1200,
      height: 800,
      sortOrder: 1,
    });
  }
  return list;
}

export function CategoryForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [images, setImages] = useState<UploadedImage[]>(() =>
    imagesFromInitial(initial)
  );

  const folder = cloudinaryFolderForCategory(
    initial?.slug || slugify(name) || "draft"
  );

  function resetCreateForm() {
    setName("");
    setDescription("");
    setActive(true);
    setImages([]);
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cover = images[0]
      ? { publicId: images[0].publicId, version: images[0].version }
      : null;
    const hover = images[1]
      ? { publicId: images[1].publicId, version: images[1].version }
      : null;

    startTransition(async () => {
      const payload = {
        name,
        description,
        active,
        image: cover,
        hoverImage: hover,
      };
      const result = initial
        ? await updateCategory({ ...payload, id: initial.id })
        : await createCategory(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (initial) {
        router.push("/admin/categorias");
        router.refresh();
      } else {
        resetCreateForm();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Nombre</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cat-desc">Descripción</Label>
        <Textarea
          id="cat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="cat-active"
          checked={active}
          onCheckedChange={setActive}
        />
        <Label htmlFor="cat-active">Activa</Label>
      </div>
      <div className="space-y-2">
        <Label>Fotos</Label>
        <ImageUploader
          folder={folder}
          kind="category"
          value={images}
          onChange={(next) => setImages(next.slice(0, 2))}
          max={2}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Spinner />
            Guardando…
          </>
        ) : initial ? (
          "Guardar"
        ) : (
          "Crear categoría"
        )}
      </Button>
    </form>
  );
}
