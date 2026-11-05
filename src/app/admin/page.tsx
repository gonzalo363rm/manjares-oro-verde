import Link from "next/link";

import { countPendingOrders } from "@/actions/orders";
import { getCloudinaryUsage } from "@/lib/cloudinary";

export const metadata = {
  title: "Admin | Manjares de Oro Verde",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [pendingCount, usage] = await Promise.all([
    countPendingOrders(),
    getCloudinaryUsage(),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900">Administración</h1>
      <p className="mt-2 text-sm text-stone-600">
        Panel interno de Manjares de Oro Verde.
      </p>

      {pendingCount > 0 ? (
        <Link
          href="/admin/pedidos?status=PENDIENTE_CONFIRMACION"
          className="mt-6 block rounded-2xl border border-orange-300 bg-orange-50 px-4 py-4 shadow-sm hover:border-orange-400"
        >
          <span className="font-semibold text-orange-900">
            {pendingCount} pedido{pendingCount === 1 ? "" : "s"} para confirmar
          </span>
          <p className="text-sm text-orange-800/80">
            Revisá los pendientes de confirmación
          </p>
        </Link>
      ) : null}

      <ul className="mt-6 space-y-3">
        <AdminCard
          href="/admin/pedidos"
          title="Pedidos"
          description="Seña, envío, descuentos, totales y estados"
        />
        <AdminCard
          href="/admin/productos"
          title="Productos"
          description="Alta, edición, precios e imágenes"
        />
        <AdminCard
          href="/admin/categorias"
          title="Categorías"
          description="Portadas y orden del catálogo"
        />
        <AdminCard
          href="/admin/ventas"
          title="Ventas"
          description="Unidades y montos por producto o categoría"
        />
      </ul>

      {usage ? (
        <p className="mt-8 text-xs text-stone-500">
          Cloudinary (últimos 30 días): {usage.creditsUsage.toFixed(2)} /{" "}
          {usage.creditsLimit} créditos
        </p>
      ) : null}
    </main>
  );
}

function AdminCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm hover:border-emerald-300"
      >
        <span className="font-semibold text-emerald-900">{title}</span>
        <p className="text-sm text-stone-600">{description}</p>
      </Link>
    </li>
  );
}
