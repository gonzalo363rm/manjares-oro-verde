export type CartHashItem = {
  productId: string;
  quantity: number;
};

export type CartHashPayload = {
  items: CartHashItem[];
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  eventDate?: string | null;
  eventType?: string | null;
  guests?: number | null;
  comments?: string | null;
};

/** Stable hash for reusing the same order code when cart+event unchanged. */
export function hashCartPayload(payload: CartHashPayload): string {
  const normalized = {
    items: [...payload.items]
      .map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId)),
    contactName: payload.contactName.trim().toLowerCase(),
    contactPhone: payload.contactPhone.replace(/\D/g, ""),
    contactEmail: payload.contactEmail?.trim().toLowerCase() || null,
    eventDate: payload.eventDate ?? null,
    eventType: payload.eventType?.trim().toLowerCase() ?? null,
    guests: payload.guests ?? null,
    comments: payload.comments?.trim().toLowerCase() ?? null,
  };

  const json = JSON.stringify(normalized);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    hash = (hash << 5) - hash + json.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}
