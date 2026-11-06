import { displayOrderCode, normalizeOrderCode } from "@/lib/order-code";

export type WaCartItem = {
  name: string;
  quantity: number;
  unitPrice: number | null;
};

export type WaEventData = {
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  eventDate?: string | null;
  eventType?: string | null;
  guests?: number | null;
  comments?: string | null;
};

export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}

/** Chat vacío (footer / contacto). Sin número → null. */
export function getWhatsAppChatUrl(): string | null {
  const phone = getWhatsAppNumber();
  if (!phone) return null;
  return `https://wa.me/${phone}`;
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function buildOrderTrackingUrl(code: string): string {
  return `${getAppUrl()}/pedido/${encodeURIComponent(normalizeOrderCode(code))}`;
}

export function buildOrderMessage(
  code: string,
  cart: WaCartItem[],
  event: WaEventData
): string {
  const lines: string[] = [
    "[Pedido web Manjares]",
    `Código: ${displayOrderCode(code)}`,
    `Seguimiento: ${buildOrderTrackingUrl(code)}`,
    "",
    `Contacto: ${event.contactName} — ${event.contactPhone}`,
  ];

  if (event.contactEmail?.trim()) {
    lines.push(`Email: ${event.contactEmail.trim()}`);
  }
  if (event.eventType) lines.push(`Evento: ${event.eventType}`);
  if (event.eventDate) lines.push(`Fecha: ${event.eventDate}`);
  if (event.guests != null) lines.push(`Personas: ${event.guests}`);
  lines.push("", "Productos:");

  for (const item of cart) {
    const price =
      item.unitPrice == null
        ? "Consultar"
        : `$${item.unitPrice.toLocaleString("es-AR")}`;
    lines.push(`- ${item.quantity}x ${item.name} (${price})`);
  }

  if (event.comments?.trim()) {
    lines.push("", `Comentarios: ${event.comments.trim()}`);
  }

  return lines.join("\n");
}

export function buildInquiryMessage(text: string): string {
  const body = text.trim() || "(sin detalle)";
  return ["[Consulta producto Manjares]", "", body].join("\n");
}

export function buildWaMeUrl(message: string): string {
  const phone = getWhatsAppNumber();
  const encoded = encodeURIComponent(message);
  if (!phone) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${phone}?text=${encoded}`;
}
