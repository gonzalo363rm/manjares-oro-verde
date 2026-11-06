"use client";

import { useEffect, useState } from "react";
import { IoAdd, IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";

import { signImageUpload } from "@/actions/products";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

async function uploadOneFile(opts: {
  file: File;
  folder: string;
  kind: "category" | "product";
  index: number;
}): Promise<UploadedImage | { error: string }> {
  const signed = await signImageUpload({
    folder: opts.folder,
    kind: opts.kind,
    index: opts.index,
  });
  if (!signed.ok) return { error: signed.error };

  const body = new FormData();
  body.append("file", opts.file);
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
    return { error: json.error?.message ?? "Error al subir" };
  }

  return {
    publicId: json.public_id,
    version: json.version,
    width: json.width ?? 1,
    height: json.height ?? 1,
    sortOrder: opts.index,
  };
}

export function ImageUploader({
  folder,
  kind,
  value,
  onChange,
  max = 6,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const previewOpen = previewIndex != null && previewIndex < value.length;
  const previewImage =
    previewIndex != null ? (value[previewIndex] ?? null) : null;

  useEffect(() => {
    if (previewIndex == null) return;
    if (value.length === 0) {
      setPreviewIndex(null);
      return;
    }
    if (previewIndex >= value.length) {
      setPreviewIndex(value.length - 1);
    }
  }, [previewIndex, value.length]);

  useEffect(() => {
    if (!previewOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPreviewIndex((i) =>
          i == null ? i : (i - 1 + value.length) % value.length
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPreviewIndex((i) => (i == null ? i : (i + 1) % value.length));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen, value.length]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const slots = max - value.length;
    if (slots <= 0) {
      setError(`Máximo ${max} imágenes`);
      return;
    }

    const selected = files.slice(0, slots);
    setError(
      files.length > slots
        ? `Solo se pueden agregar ${slots} más (máximo ${max})`
        : null
    );
    setUploading(true);
    setUploadProgress(
      selected.length > 1 ? `Subiendo 0/${selected.length}` : null
    );

    const base = value.length;
    const uploaded: UploadedImage[] = [];

    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        if (!file) continue;
        if (selected.length > 1) {
          setUploadProgress(`Subiendo ${i + 1}/${selected.length}`);
        }
        const result = await uploadOneFile({
          file,
          folder,
          kind,
          index: base + i,
        });
        if ("error" in result) {
          setError(result.error);
          break;
        }
        uploaded.push({ ...result, sortOrder: base + uploaded.length });
      }

      if (uploaded.length > 0) {
        onChange([
          ...value,
          ...uploaded.map((img, i) => ({ ...img, sortOrder: base + i })),
        ]);
      }
    } catch {
      setError("No se pudo subir la imagen");
    } finally {
      setUploading(false);
      setUploadProgress(null);
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
      value
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, sortOrder: i }))
    );
  }

  const canAdd = value.length < max && !uploading;
  const allowMultiple = max - value.length > 1;
  const helpText =
    max <= 1
      ? "JPG, PNG, WebP o HEIC · máx. 10 MB"
      : "JPG, PNG, WebP o HEIC · máx. 10 MB · podés elegir varias · la 1ª es principal, la 2ª aparece al pasar el mouse";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((img, index) => (
          <div
            key={`${img.publicId}-${img.version}`}
            className="relative size-28 overflow-hidden rounded-xl border border-border bg-muted"
          >
            <button
              type="button"
              className="absolute inset-0 cursor-zoom-in"
              onClick={() => setPreviewIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <CloudinaryImage
                publicId={img.publicId}
                version={img.version}
                alt={img.alt ?? `Imagen ${index + 1}`}
                fill
                className="object-cover"
                sizes="112px"
              />
            </button>
            <div className="absolute inset-x-0 bottom-0 z-10 flex gap-0.5 bg-black/55 p-1">
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
              <span className="pointer-events-none absolute top-1 left-1 z-10 rounded bg-emerald-700 px-1 text-[10px] text-white">
                Principal
              </span>
            ) : null}
            {index === 1 && max > 1 ? (
              <span className="pointer-events-none absolute top-1 left-1 z-10 rounded bg-orange-600 px-1 text-[10px] text-white">
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
              <>
                <Spinner className="size-6" />
                {uploadProgress ? (
                  <span className="mt-1 text-[10px] font-medium">
                    {uploadProgress}
                  </span>
                ) : null}
              </>
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
              multiple={allowMultiple}
              disabled={uploading || value.length >= max}
              onChange={onFileChange}
            />
          </label>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">{helpText}</p>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          if (!open) setPreviewIndex(null);
        }}
      >
        <DialogContent
          showCloseButton
          className="max-h-[90vh] w-[min(100%-1.5rem,40rem)] overflow-y-auto p-0 sm:max-w-xl"
        >
          <div className="relative aspect-square bg-stone-100 sm:aspect-[4/3]">
            {previewImage ? (
              <CloudinaryImage
                publicId={previewImage.publicId}
                version={previewImage.version}
                alt={previewImage.alt ?? `Imagen ${(previewIndex ?? 0) + 1}`}
                fill
                quality="best"
                className="object-contain"
                sizes="(min-width: 640px) 40rem, 100vw"
              />
            ) : null}

            {value.length > 1 && previewIndex != null ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                  onClick={() =>
                    setPreviewIndex(
                      (previewIndex - 1 + value.length) % value.length
                    )
                  }
                  aria-label="Imagen anterior"
                >
                  <IoChevronBack className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                  onClick={() =>
                    setPreviewIndex((previewIndex + 1) % value.length)
                  }
                  aria-label="Imagen siguiente"
                >
                  <IoChevronForward className="size-5" />
                </Button>
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-white tabular-nums">
                  {previewIndex + 1} / {value.length}
                </p>
              </>
            ) : null}
          </div>
          <DialogHeader className="space-y-1 px-4 pt-3 pb-4 text-left">
            <DialogTitle>
              {previewIndex === 0
                ? "Imagen principal"
                : previewIndex === 1 && max > 1
                  ? "Imagen de hover"
                  : `Imagen ${(previewIndex ?? 0) + 1}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Vista previa de la imagen cargada
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
