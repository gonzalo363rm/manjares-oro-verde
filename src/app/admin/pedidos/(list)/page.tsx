import Link from "next/link";
import type { OrderStatus } from "@prisma/client";

import { listAdminOrders } from "@/actions/orders";
import { AdminOrderStatusFilter } from "@/components/admin/AdminOrderStatusFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TextLink } from "@/components/ui/TextLink";
import { displayOrderCode } from "@/lib/order-code";
import { formatMoneyARS } from "@/lib/order-money";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export const metadata = {
  title: "Admin pedidos | Manjares",
  robots: { index: false, follow: false },
};

export default async function AdminPedidosPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const status =
    statusParam && statusParam !== "ALL"
      ? (statusParam as OrderStatus)
      : "ALL";
  const orders = await listAdminOrders(status);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <TextLink href="/admin" icon="back">
            Admin
          </TextLink>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Pedidos</h1>
        </div>
        <AdminOrderStatusFilter status={statusParam ?? "ALL"} />
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No hay pedidos con ese filtro.
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Restante</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.code}>
                  <TableCell className="font-mono font-semibold">
                    {displayOrderCode(order.code)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "PENDIENTE_CONFIRMACION"
                          ? "secondary"
                          : order.status === "CANCELADO"
                            ? "outline"
                            : "default"
                      }
                    >
                      {order.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>{order.contactName}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.contactPhone}
                      {order.userEmail ? ` · ${order.userEmail}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>{formatMoneyARS(order.total)}</TableCell>
                  <TableCell>{formatMoneyARS(order.remaining)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/pedidos/${order.code}`}>Editar</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
