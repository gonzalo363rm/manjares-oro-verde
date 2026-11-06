import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TextLink } from "@/components/ui/TextLink";
import { getSalesByCategory, getSalesByProduct } from "@/lib/sales-stats";
import { formatMoneyARS } from "@/lib/order-money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin ventas | Manjares",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default async function AdminVentasPage({ searchParams }: Props) {
  const params = await searchParams;
  const defaults = defaultRange();
  const fromStr = params.from || defaults.from;
  const toStr = params.to || defaults.to;
  const from = new Date(`${fromStr}T00:00:00.000Z`);
  const to = new Date(`${toStr}T23:59:59.999Z`);

  const [byProduct, byCategory] = await Promise.all([
    getSalesByProduct({ from, to }),
    getSalesByCategory({ from, to }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <TextLink href="/admin" icon="back">
        Admin
      </TextLink>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Ventas</h1>

      <form className="mb-6 flex flex-wrap items-end justify-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="from">Desde</Label>
          <Input
            id="from"
            type="date"
            name="from"
            defaultValue={fromStr}
            className="w-auto"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Hasta</Label>
          <Input
            id="to"
            type="date"
            name="to"
            defaultValue={toStr}
            className="w-auto"
          />
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Por producto</h2>
        <StatsTable
          rows={byProduct.map((r) => ({
            key: r.productId ?? r.productName,
            label: r.productName,
            units: r.units,
            orders: r.orders,
            gross: r.gross,
            net: r.net,
          }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Por categoría</h2>
        <StatsTable
          rows={byCategory.map((r) => ({
            key: r.categoryId ?? r.categoryName,
            label: r.categoryName,
            units: r.units,
            orders: r.orders,
            gross: r.gross,
            net: r.net,
          }))}
        />
      </section>
    </main>
  );
}

function StatsTable({
  rows,
}: {
  rows: Array<{
    key: string;
    label: string;
    units: number;
    orders: number;
    gross: number;
    net: number;
  }>;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Sin ventas en el período.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Unidades</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Bruto</TableHead>
            <TableHead>Neto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.key}>
              <TableCell className="font-medium">{r.label}</TableCell>
              <TableCell>{r.units}</TableCell>
              <TableCell>{r.orders}</TableCell>
              <TableCell>{formatMoneyARS(r.gross)}</TableCell>
              <TableCell>{formatMoneyARS(r.net)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
