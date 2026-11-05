import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

const UPLOAD_TRANSFORMATION = "c_limit,w_2400,h_2400";

export function signCloudinaryUpload(params: {
  folder: string;
  /** English leaf name, e.g. cover-abc123 or image-01-abc123 */
  publicId: string;
  timestamp: number;
}): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  transformation: string;
} {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !cloudName || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary no configurado");
  }

  // folder + public_id (relative) → asset at folder/publicId
  const toSign = {
    folder: params.folder,
    public_id: params.publicId,
    timestamp: params.timestamp,
    transformation: UPLOAD_TRANSFORMATION,
  };

  const signature = cloudinary.utils.api_sign_request(
    toSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp: params.timestamp,
    apiKey,
    cloudName,
    folder: params.folder,
    publicId: params.publicId,
    transformation: UPLOAD_TRANSFORMATION,
  };
}

export async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  if (!publicId || !process.env.CLOUDINARY_API_SECRET) return;
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.error("[cloudinary] destroy failed", publicId, err);
  }
}

export async function getCloudinaryUsage(): Promise<{
  creditsUsage: number;
  creditsLimit: number;
} | null> {
  if (!process.env.CLOUDINARY_API_SECRET) return null;
  try {
    const usage = await cloudinary.api.usage();
    const credits = usage.credits as
      | { usage?: number; limit?: number }
      | undefined;
    return {
      creditsUsage: Number(credits?.usage ?? 0),
      creditsLimit: Number(credits?.limit ?? 25),
    };
  } catch (err) {
    console.error("[cloudinary] usage failed", err);
    return null;
  }
}
