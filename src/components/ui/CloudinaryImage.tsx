"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

import {
  buildCloudinaryUrl,
  type CloudinaryQuality,
} from "@/lib/cloudinary-url";

type Props = Omit<ImageProps, "src" | "loader" | "quality"> & {
  publicId: string;
  version: number;
  quality?: CloudinaryQuality;
  sharpen?: boolean;
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
  ...rest
}: Props) {
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
    />
  );
}
