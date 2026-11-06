"use client";

import { useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildCloudinaryUrl } from "@/lib/cloudinary-url";
import { formatMoneyARS } from "@/lib/order-money";

type Image = {
  publicId: string;
  version: number;
};

type Props = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  unitNote: string | null;
  description?: string | null;
  images: Image[];
};

export function ProductCard({
  id,
  name,
  slug,
  price,
  unitNote,
  description,
  images,
}: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const primary = images[0];
  const secondary = images[1];
  const hasImages = images.length > 0;
  const current = images[index] ?? primary;
  const descriptionText = description?.trim() || "";

  const cartImage = primary
    ? buildCloudinaryUrl({
        publicId: primary.publicId,
        version: primary.version,
        width: 400,
      })
    : undefined;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => (i - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => (i + 1) % images.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, images.length]);

  function openPreview() {
    if (!hasImages) return;
    setIndex(0);
    setOpen(true);
  }

  function goPrev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <>
      <article className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <button
          type="button"
          className={`relative aspect-square w-full shrink-0 overflow-hidden bg-stone-100 text-left ${
            hasImages ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={openPreview}
          disabled={!hasImages}
          aria-label={hasImages ? `Ver fotos de ${name}` : undefined}
        >
          {primary ? (
            <>
              <CloudinaryImage
                publicId={primary.publicId}
                version={primary.version}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
              />
              {secondary ? (
                <CloudinaryImage
                  publicId={secondary.publicId}
                  version={secondary.version}
                  alt=""
                  fill
                  quality="best"
                  className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              Sin imagen
            </div>
          )}
        </button>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex-1">
            <h3 className="font-semibold text-stone-900">{name}</h3>
            {unitNote ? (
              <p className="text-xs text-stone-500">{unitNote}</p>
            ) : null}
            {descriptionText ? (
              <p className="mt-1.5 line-clamp-3 text-sm leading-snug text-stone-600">
                {descriptionText}
              </p>
            ) : null}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <p className="font-medium text-emerald-900">
              {formatMoneyARS(price)}
            </p>
            <AddToCartButton
              product={{ id, name, slug, price, image: cartImage }}
            />
          </div>
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="max-h-[90vh] w-[min(100%-1.5rem,40rem)] overflow-y-auto p-0 sm:max-w-xl"
        >
          <div className="relative aspect-square bg-stone-100 sm:aspect-[4/3]">
            {current ? (
              <CloudinaryImage
                publicId={current.publicId}
                version={current.version}
                alt={`${name} — foto ${index + 1}`}
                fill
                quality="best"
                className="object-contain"
                sizes="(min-width: 640px) 40rem, 100vw"
              />
            ) : null}

            {images.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                >
                  <IoChevronBack className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/90 shadow-md hover:bg-white"
                  onClick={goNext}
                  aria-label="Imagen siguiente"
                >
                  <IoChevronForward className="size-5" />
                </Button>
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-white tabular-nums">
                  {index + 1} / {images.length}
                </p>
              </>
            ) : null}
          </div>

          <DialogHeader className="space-y-2 px-4 pt-3 pb-4 text-left">
            <DialogTitle>{name}</DialogTitle>
            {unitNote ? (
              <p className="text-xs text-muted-foreground">{unitNote}</p>
            ) : null}
            {descriptionText ? (
              <DialogDescription className="text-sm leading-relaxed text-stone-600">
                {descriptionText}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">
                Vista previa de {name}
              </DialogDescription>
            )}
            <p className="font-medium text-emerald-900">
              {formatMoneyARS(price)}
            </p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
