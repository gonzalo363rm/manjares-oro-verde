import { buildCloudinaryUrl } from "@/lib/cloudinary-url";
import { toNumber } from "@/lib/order-money";

type CartWithItems = {
  items: Array<{
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: unknown;
      images: Array<{
        publicId: string;
        version: number;
      }>;
    };
  }>;
};

export type CartDtoItem = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  quantity: number;
  image?: string;
};

export function mapCartToDto(cart: CartWithItems | null): CartDtoItem[] {
  if (!cart) return [];
  return cart.items.map((item) => {
    const img = item.product.images[0];
    const rawPrice = item.product.price;
    const price =
      rawPrice == null
        ? null
        : toNumber(
            typeof rawPrice === "number" || typeof rawPrice === "string"
              ? rawPrice
              : String(rawPrice)
          );
    return {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price,
      quantity: item.quantity,
      image: img
        ? buildCloudinaryUrl({
            publicId: img.publicId,
            version: img.version,
            width: 400,
          })
        : undefined,
    };
  });
}

export const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
        },
      },
    },
  },
} as const;
