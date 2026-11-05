import { notFound } from "next/navigation";

import { getAdminOrderByCode } from "@/actions/orders";
import { AdminOrderEditForm } from "@/components/admin/AdminOrderEditForm";
import { TextLink } from "@/components/ui/TextLink";
import { displayOrderCode } from "@/lib/order-code";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
};

export const metadata = {
  title: "Editar pedido | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPedidoDetailPage({ params }: Props) {
  const { code } = await params;
  const order = await getAdminOrderByCode(code);
  if (!order) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <TextLink href="/admin/pedidos" icon="back">
        Volver a pedidos
      </TextLink>

      <header className="mt-4 mb-6 space-y-1">
        <h1 className="font-mono text-2xl font-bold text-emerald-900">
          {displayOrderCode(order.code)}
        </h1>
        <p className="text-sm text-stone-600">
          {ORDER_STATUS_LABELS[order.status]} · {order.contactName} ·{" "}
          {order.contactPhone}
        </p>
        {order.user?.email ? (
          <p className="text-xs text-stone-500">Cuenta: {order.user.email}</p>
        ) : (
          <p className="text-xs text-amber-700">Sin cuenta vinculada</p>
        )}
        <TextLink
          href={`/pedido/${order.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary"
        >
          Ver vista pública
        </TextLink>
      </header>

      <AdminOrderEditForm
        code={order.code}
        initial={{
          status: order.status,
          deliveryMethod: order.deliveryMethod,
          shippingAddress: order.shippingAddress,
          shippingCost: order.shippingCost,
          itemsTotal: order.itemsTotal,
          total: order.total,
          depositAmount: order.depositAmount,
          discountAmount: order.discountAmount,
          discountReason: order.discountReason,
          totalOverride: order.totalOverride,
          adminNotes: order.adminNotes,
          items: order.items,
        }}
        changeLogs={order.changeLogs}
      />
    </main>
  );
}
