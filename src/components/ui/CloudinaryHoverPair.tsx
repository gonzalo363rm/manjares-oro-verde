"use client";

import { useState } from "react";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { cn } from "@/lib/utils";

type ImageRef = {
  publicId: string;
  version: number;
};

type Props = {
  primary: ImageRef;
  hover?: ImageRef | null;
  alt: string;
  hoverAlt?: string;
  sizes: string;
  quality?: "good" | "best";
  className?: string;
  imageClassName?: string;
  hoverClassName?: string;
  draggable?: boolean;
  fadeIn?: boolean;
};

/** Primary image lazy; hover image mounts on first pointer/focus (no double fetch). */
export function CloudinaryHoverPair({
  primary,
  hover,
  alt,
  hoverAlt,
  sizes,
  quality = "good",
  className,
  imageClassName,
  hoverClassName,
  draggable = false,
  fadeIn = false,
}: Props) {
  const [hoverReady, setHoverReady] = useState(false);

  return (
    <div
      className={cn("absolute inset-0", className)}
      onPointerEnter={() => {
        if (hover) setHoverReady(true);
      }}
      onFocusCapture={() => {
        if (hover) setHoverReady(true);
      }}
    >
      <CloudinaryImage
        publicId={primary.publicId}
        version={primary.version}
        alt={alt}
        fill
        quality={quality}
        draggable={draggable}
        fadeIn={fadeIn}
        className={imageClassName}
        sizes={sizes}
      />
      {hover && hoverReady ? (
        <CloudinaryImage
          publicId={hover.publicId}
          version={hover.version}
          alt={hoverAlt ?? `${alt} — vista alternativa`}
          fill
          quality={quality}
          draggable={draggable}
          className={hoverClassName}
          sizes={sizes}
        />
      ) : null}
    </div>
  );
}
