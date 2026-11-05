import { getAdminEmails } from "@/lib/admin";
import { displayOrderCode } from "@/lib/order-code";
import { formatMoneyARS } from "@/lib/order-money";
import { sendMail } from "@/lib/mailer";

export function getAdminNotifyEmails(): string[] {
  const explicit = (process.env.ADMIN_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return explicit.length > 0 ? explicit : getAdminEmails();
}

type OrderEmailInput = {
  code: string;
  contactName: string;
  contactPhone: string;
  eventDate?: string | null;
  eventType?: string | null;
  items: Array<{ productName: string; quantity: number; unitPrice: number | null }>;
  total: number | null;
};

export async function notifyAdminNewOrder(
  order: OrderEmailInput
): Promise<void> {
  const to = getAdminNotifyEmails();
  if (to.length === 0) {
    console.info("[order-email] sin destinatarios admin");
    return;
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  const adminUrl = `${appUrl}/admin/pedidos/${order.code}`;

  const lines = order.items.map(
    (i) =>
      `- ${i.productName} x${i.quantity} (${formatMoneyARS(i.unitPrice)})`
  );

  const label = displayOrderCode(order.code);

  const text = [
    `Nuevo pedido ${label}`,
    `Contacto: ${order.contactName} · ${order.contactPhone}`,
    order.eventDate ? `Fecha evento: ${order.eventDate}` : null,
    order.eventType ? `Tipo: ${order.eventType}` : null,
    "",
    "Ítems:",
    ...lines,
    "",
    `Total: ${formatMoneyARS(order.total)}`,
    `Admin: ${adminUrl}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html = `
    <h2>Nuevo pedido <code>${label}</code></h2>
    <p><strong>Contacto:</strong> ${order.contactName} · ${order.contactPhone}</p>
    ${order.eventDate ? `<p><strong>Fecha evento:</strong> ${order.eventDate}</p>` : ""}
    ${order.eventType ? `<p><strong>Tipo:</strong> ${order.eventType}</p>` : ""}
    <ul>${order.items
      .map(
        (i) =>
          `<li>${i.productName} × ${i.quantity} — ${formatMoneyARS(i.unitPrice)}</li>`
      )
      .join("")}</ul>
    <p><strong>Total:</strong> ${formatMoneyARS(order.total)}</p>
    <p><a href="${adminUrl}">Abrir en admin</a></p>
  `;

  await sendMail({
    to,
    subject: `[Manjares] Nuevo pedido ${label}`,
    text,
    html,
  });
}
