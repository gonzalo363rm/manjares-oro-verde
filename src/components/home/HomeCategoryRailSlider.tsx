"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { cn } from "@/lib/utils";

type ProductPreview = {
  id: string;
  name: string;
  slug: string;
  images: { publicId: string; version: number }[];
};

type Props = {
  categoryName: string;
  categorySlug: string;
  products: ProductPreview[];
};

export function HomeCategoryRailSlider({
  categoryName,
  categorySlug,
  products,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const overflow = max > 4;
      setCanPrev(overflow && el.scrollLeft > 4);
      setCanNext(overflow && el.scrollLeft < max - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [products.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.8, 320);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 5) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.startScroll - dx;
  }

  function endDrag(e: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    try {
      scrollerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragRef.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current.moved = false;
  }

  const showArrows = canPrev || canNext;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={cn(
          "-mx-1 flex gap-3 overflow-x-auto px-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab select-none active:cursor-grabbing",
          dragging && "snap-none cursor-grabbing"
        )}
        role="list"
        aria-label={`Productos de ${categoryName}`}
      >
        {products.map((product) => {
          const primary = product.images[0];
          const hover = product.images[1];
          const href = `/catalogo/${categorySlug}?producto=${encodeURIComponent(product.slug)}`;
          return (
            <Link
              key={product.id}
              href={href}
              draggable={false}
              role="listitem"
              className="group relative aspect-[3/4] w-[42vw] max-w-[11.5rem] shrink-0 snap-start overflow-hidden rounded-2xl bg-stone-100 sm:w-44"
            >
              {primary ? (
                <>
                  <CloudinaryImage
                    publicId={primary.publicId}
                    version={primary.version}
                    alt={product.name}
                    fill
                    draggable={false}
                    className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 640px) 176px, 42vw"
                  />
                  {hover ? (
                    <CloudinaryImage
                      publicId={hover.publicId}
                      version={hover.version}
                      alt={`${product.name} — vista alternativa`}
                      fill
                      draggable={false}
                      className="pointer-events-none object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                      sizes="(min-width: 640px) 176px, 42vw"
                    />
                  ) : null}
                </>
              ) : (
                <div className="flex h-full items-center justify-center bg-[var(--header-soft)] p-3 text-center text-xs text-stone-500">
                  {product.name}
                </div>
              )}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/65 to-transparent px-2.5 pt-8 pb-2.5 text-[13px] font-medium leading-snug text-white">
                <span className="line-clamp-2">{product.name}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {showArrows ? (
        <>
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            disabled={!canPrev}
            className="absolute top-1/2 left-0 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-stone-700 shadow-sm transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:left-1"
            aria-label={`Anterior en ${categoryName}`}
          >
            <IoChevronBack className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            disabled={!canNext}
            className="absolute top-1/2 right-0 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-stone-700 shadow-sm transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:right-1"
            aria-label={`Siguiente en ${categoryName}`}
          >
            <IoChevronForward className="size-5" aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}
