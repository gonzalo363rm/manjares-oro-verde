import Link from "next/link";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

type Props = {
  name: string;
  slug: string;
  description: string;
  imagePublicId?: string | null;
  imageVersion?: number | null;
  hoverImagePublicId?: string | null;
  hoverImageVersion?: number | null;
  fallbackPublicId?: string | null;
  fallbackVersion?: number | null;
};

export function CategoryCard({
  name,
  slug,
  description,
  imagePublicId,
  imageVersion,
  hoverImagePublicId,
  hoverImageVersion,
  fallbackPublicId,
  fallbackVersion,
}: Props) {
  const publicId = imagePublicId || fallbackPublicId;
  const version = imagePublicId ? imageVersion : fallbackVersion;
  const hoverPublicId = hoverImagePublicId;
  const hoverVersion = hoverImageVersion;

  return (
    <Link
      href={`/catalogo/${slug}`}
      className="card-lift group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <div className="relative aspect-[4/3] bg-stone-100">
        {publicId && version ? (
          <>
            <CloudinaryImage
              publicId={publicId}
              version={version}
              alt={name}
              fill
              quality="best"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
            />
            {hoverPublicId && hoverVersion ? (
              <CloudinaryImage
                publicId={hoverPublicId}
                version={hoverVersion}
                alt={`${name} — vista alternativa`}
                fill
                quality="best"
                className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
              />
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--header-soft)] text-sm text-stone-500">
            {name}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-900">{name}</h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
