"use client";

import { useState } from "react";
import { IoAdd, IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";

import { signImageUpload } from "@/actions/products";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Spinner } from "@/components/ui/spinner";

export type UploadedImage = {
  publicId: string;
  version: number;
  width: number;
  height: number;
  sortOrder: number;
  alt?: string | null;
};

type Props = {
  folder: string;
  /** Separates category covers from product gallery assets in Cloudinary. */
  kind: "category" | "product";
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
};

export function ImageUploader({
  folder,
  kind,
  value,
  onChange,
  max = 6,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (value.length >= max) {
      setError(`Máximo ${max} imágenes`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const signed = await signImageUpload({
        folder,
        kind,
        index: value.length,
      });
      if (!signed.ok) {
        setError(signed.error);
        return;
      }

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signed.apiKey);
      body.append("timestamp", String(signed.timestamp));
      body.append("signature", signed.signature);
      body.append("folder", signed.folder);
      body.append("public_id", signed.publicId);
      body.append("transformation", signed.transformation);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
        { method: "POST", body }
      );
      const json = (await res.json()) as {
        public_id?: string;
        version?: number;
        width?: number;
        height?: number;
        error?: { message?: string };
      };

      if (!res.ok || !json.public_id || !json.version) {
        setError(json.error?.message ?? "Error al subir");
        return;
      }

      onChange([
        ...value,
        {
          publicId: json.public_id,
          version: json.version,
          width: json.width ?? 1,
          height: json.height ?? 1,
          sortOrder: value.length,
        },
      ]);
    } catch {
      setError("No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  function remove(index: number) {
    onChange(
      value.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i }))
    );
  }

  const canAdd = value.length < max && !uploading;
  const helpText =
    max <= 1
      ? "JPG, PNG, WebP o HEIC · máx. 10 MB"
      : "JPG, PNG, WebP o HEIC · máx. 10 MB · la 1ª es principal, la 2ª aparece al pasar el mouse";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((img, index) => (
          <div
            key={`${img.publicId}-${img.version}`}
            className="relative size-28 overflow-hidden rounded-xl border border-border bg-muted"
          >
            <CloudinaryImage
              publicId={img.publicId}
              version={img.version}
              alt={img.alt ?? `Imagen ${index + 1}`}
              fill
              className="object-cover"
              sizes="112px"
            />
            <div className="absolute inset-x-0 bottom-0 flex gap-0.5 bg-black/55 p-1">
              <button
                type="button"
                className="flex flex-1 items-center justify-center py-0.5 text-white disabled:opacity-40"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Mover a la izquierda"
              >
                <IoChevronBack className="size-3.5" />
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center py-0.5 text-white"
                onClick={() => remove(index)}
                aria-label="Quitar imagen"
              >
                <IoClose className="size-3.5" />
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center py-0.5 text-white disabled:opacity-40"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label="Mover a la derecha"
              >
                <IoChevronForward className="size-3.5" />
              </button>
            </div>
            {index === 0 ? (
              <span className="absolute top-1 left-1 rounded bg-emerald-700 px-1 text-[10px] text-white">
                Principal
              </span>
            ) : null}
            {index === 1 && max > 1 ? (
              <span className="absolute top-1 left-1 rounded bg-orange-600 px-1 text-[10px] text-white">
                Hover
              </span>
            ) : null}
          </div>
        ))}

        {canAdd || uploading ? (
          <label
            className={`flex size-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary ${
              uploading ? "pointer-events-none opacity-70" : ""
            }`}
          >
            {uploading ? (
              <Spinner className="size-6" />
            ) : (
              <>
                <IoAdd className="size-8" aria-hidden />
                <span className="mt-1 text-[10px] font-medium">Agregar</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              disabled={uploading || value.length >= max}
              onChange={onFileChange}
            />
          </label>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  );
}
