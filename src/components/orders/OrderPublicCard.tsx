import type { PublicOrderView } from "@/actions/orders/get-order-by-code";
import { OrderMoneySummary } from "@/components/orders/OrderMoneySummary";
import { TextLink } from "@/components/ui/TextLink";
import { displayOrderCode } from "@/lib/order-code";
import { formatMoneyARS } from "@/lib/order-money";

export function OrderPublicCard({ order }: { order: PublicOrderView }) {
  return (
    <article className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          Seguimiento de pedido
        </p>
        <h1 className="font-mono text-2xl font-bold text-emerald-900">
          {displayOrderCode(order.code)}
        </h1>
        <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
          {order.statusLabel}
        </p>
      </header>

      <section className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
        <div>
          <p className="text-xs text-stone-500">Contacto</p>
          <p className="font-medium">{order.contactDisplay}</p>
        </div>
        {order.eventType ? (
          <div>
            <p className="text-xs text-stone-500">Tipo de evento</p>
            <p className="font-medium">{order.eventType}</p>
          </div>
        ) : null}
        {order.eventDate ? (
          <div>
            <p className="text-xs text-stone-500">Fecha del evento</p>
            <p className="font-medium">{order.eventDate}</p>
          </div>
        ) : null}
        {order.guests != null ? (
          <div>
            <p className="text-xs text-stone-500">Número de personas</p>
            <p className="font-medium">{order.guests}</p>
          </div>
        ) : null}
        {order.deliveryMethod ? (
          <div>
            <p className="text-xs text-stone-500">Entrega</p>
            <p className="font-medium">
              {order.deliveryMethod === "ENVIO" ? "Envío" : "Retiro"}
            </p>
          </div>
        ) : null}
        {order.shippingAddressDisplay ? (
          <div>
            <p className="text-xs text-stone-500">Zona / dirección</p>
            <p className="font-medium">{order.shippingAddressDisplay}</p>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-900">Productos</h2>
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {order.items.map((item, idx) => (
            <li
              key={`${item.productName}-${idx}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span>
                {item.quantity}× {item.productName}
              </span>
              <span className="text-stone-600">
                {formatMoneyARS(item.unitPrice)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <OrderMoneySummary
        itemsTotal={order.itemsTotal}
        shippingCost={order.shippingCost}
        discountAmount={order.discountAmount}
        discountReason={order.discountReason}
        total={order.total}
        depositAmount={order.depositAmount}
        remaining={order.remaining}
      />

      {order.comments && (order.isOwner || order.isAdmin) ? (
        <section>
          <h2 className="mb-1 text-sm font-semibold">Comentarios</h2>
          <p className="text-sm text-stone-600 whitespace-pre-wrap">
            {order.comments}
          </p>
        </section>
      ) : null}

      {order.isOwner ? (
        <TextLink href="/mis-pedidos">Ver mis pedidos</TextLink>
      ) : null}
    </article>
  );
}
