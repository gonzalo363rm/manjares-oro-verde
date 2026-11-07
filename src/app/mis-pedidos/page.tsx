import Link from "next/link";
import { redirect } from "next/navigation";

import { listMyOrders } from "@/actions/orders";
import { auth } from "@/auth";
import { TextLink } from "@/components/ui/TextLink";
import { displayOrderCode } from "@/lib/order-code";
import { formatMoneyARS } from "@/lib/order-money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis pedidos | Manjares de Oro Verde",
  robots: { index: false, follow: false },
};

export default async function MisPedidosPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/mis-pedidos");
  }

  const orders = await listMyOrders();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <TextLink href="/" icon="back">
        Inicio
      </TextLink>
      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Mis pedidos</h1>
        <p className="text-sm text-stone-600">{session.user.email}</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
          Todavía no tenés pedidos. Cuando armes uno por WhatsApp estando
          conectado con esta cuenta, van a aparecer acá.
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.code}>
              <Link
                href={`/pedido/${order.code}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm transition hover:border-emerald-300"
              >
                <div>
                  <p className="font-mono font-semibold text-emerald-900">
                    {displayOrderCode(order.code)}
                  </p>
                  <p className="text-sm text-stone-600">{order.statusLabel}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(order.createdAt).toLocaleString("es-AR")} ·{" "}
                    {order.itemCount} ítem(s)
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{formatMoneyARS(order.total)}</p>
                  {order.remaining != null ? (
                    <p className="text-xs text-stone-500">
                      Resta {formatMoneyARS(order.remaining)}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
