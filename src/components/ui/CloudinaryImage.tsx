"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { useState } from "react";

import {
  buildCloudinaryUrl,
  type CloudinaryQuality,
} from "@/lib/cloudinary-url";
import { cn } from "@/lib/utils";

type Props = Omit<ImageProps, "src" | "loader" | "quality"> & {
  publicId: string;
  version: number;
  quality?: CloudinaryQuality;
  sharpen?: boolean;
  /** Soft fade when the image finishes loading. */
  fadeIn?: boolean;
};

function makeLoader(opts: {
  publicId: string;
  version: number;
  quality: CloudinaryQuality;
  sharpen: boolean;
}) {
  return ({ width }: ImageLoaderProps) =>
    buildCloudinaryUrl({
      publicId: opts.publicId,
      version: opts.version,
      width,
      quality: opts.quality,
      sharpen: opts.sharpen,
    });
}

export function CloudinaryImage({
  publicId,
  version,
  quality = "good",
  sharpen = true,
  alt,
  priority,
  loading,
  decoding = "async",
  fadeIn = false,
  className,
  onLoad,
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(!fadeIn);

  if (!publicId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stone-100 text-xs text-stone-400">
        Sin imagen
      </div>
    );
  }

  return (
    <Image
      {...rest}
      alt={alt}
      src={publicId}
      loader={makeLoader({ publicId, version, quality, sharpen })}
      unoptimized={false}
      priority={priority}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding}
      className={cn(
        fadeIn && "transition-opacity duration-500 ease-out",
        fadeIn && (loaded ? "opacity-100" : "opacity-0"),
        className
      )}
      onLoad={(e) => {
        if (fadeIn) setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
