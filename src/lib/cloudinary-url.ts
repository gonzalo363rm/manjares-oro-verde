const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export const CLOUDINARY_WIDTHS = [400, 800, 1200, 1600] as const;

export type CloudinaryQuality = "good" | "best";

/** Root folders — categories and products stay separated. */
export const CLOUDINARY_ROOT = "manjares" as const;
export const CLOUDINARY_CATEGORIES_FOLDER = `${CLOUDINARY_ROOT}/categories`;
export const CLOUDINARY_PRODUCTS_FOLDER = `${CLOUDINARY_ROOT}/products`;

export function roundUpCloudinaryWidth(width: number): number {
  for (const w of CLOUDINARY_WIDTHS) {
    if (width <= w) return w;
  }
  return CLOUDINARY_WIDTHS[CLOUDINARY_WIDTHS.length - 1];
}

type BuildOpts = {
  publicId: string;
  version: number;
  width: number;
  quality?: CloudinaryQuality;
  sharpen?: boolean;
  format?: "auto" | "jpg";
};

export function buildCloudinaryUrl({
  publicId,
  version,
  width,
  quality = "good",
  sharpen = false,
  format = "auto",
}: BuildOpts): string {
  if (!CLOUD_NAME || !publicId) return "";

  const w = roundUpCloudinaryWidth(width);
  const q = quality === "best" ? "q_auto:best" : "q_auto:good";
  const f = format === "jpg" ? "f_jpg" : "f_auto";
  const parts = [`c_limit`, `w_${w}`, f, q];
  if (sharpen && w <= 800) parts.push("e_sharpen:40");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${parts.join(",")}/v${version}/${publicId}`;
}

export function buildMetaCatalogImageUrl(
  publicId: string,
  version: number
): string {
  return buildCloudinaryUrl({
    publicId,
    version,
    width: 1024,
    quality: "good",
    format: "jpg",
  });
}

/** Folder for category cover images: manjares/categories/{slug} */
export function cloudinaryFolderForCategory(slug: string): string {
  const safe = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-") || "draft";
  return `${CLOUDINARY_CATEGORIES_FOLDER}/${safe}`;
}

/** Folder for product gallery images: manjares/products/{productId} */
export function cloudinaryFolderForProduct(productId: string): string {
  const safe =
    productId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-") || "draft";
  return `${CLOUDINARY_PRODUCTS_FOLDER}/${safe}`;
}

/**
 * English leaf name inside the folder (no path).
 * Categories: cover-{timestamp}
 * Products: image-01-{timestamp}, image-02-{timestamp}, …
 */
export function cloudinaryAssetName(opts: {
  kind: "category" | "product";
  index?: number;
}): string {
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  if (opts.kind === "category") {
    const role = (opts.index ?? 0) === 0 ? "cover" : "hover";
    return `${role}-${stamp}`;
  }
  const n = String((opts.index ?? 0) + 1).padStart(2, "0");
  return `image-${n}-${stamp}`;
}

export function isManjaresCloudinaryPublicId(publicId: string): boolean {
  return (
    publicId.startsWith(`${CLOUDINARY_CATEGORIES_FOLDER}/`) ||
    publicId.startsWith(`${CLOUDINARY_PRODUCTS_FOLDER}/`)
  );
}
