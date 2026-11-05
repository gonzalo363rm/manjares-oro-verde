"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { listAdminProducts } from "@/actions/products";
import { adminUpdateOrder } from "@/actions/orders";
import { OrderMoneySummary } from "@/components/orders/OrderMoneySummary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";
import {
  calcOrderTotal,
  calcRemaining,
  formatMoneyARS,
  sumItemsTotal,
} from "@/lib/order-money";

type Item = {
  id?: string;
  productId?: string | null;
  productName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  quantity: number;
  unitPrice: number | null;
};

type CatalogOption = {
  id: string;
  name: string;
  price: number | null;
  categoryId: string;
  categoryName: string;
};

type Props = {
  code: string;
  initial: {
    status: string;
    deliveryMethod: string | null;
    shippingAddress: string | null;
    shippingCost: number | null;
    itemsTotal: number | null;
    total: number | null;
    depositAmount: number | null;
    discountAmount: number | null;
    discountReason: string | null;
    totalOverride: boolean;
    adminNotes: string | null;
    items: Item[];
  };
  changeLogs?: Array<{
    id: string;
    adminEmail: string;
    summary: string;
    createdAt: string;
  }>;
};

export function AdminOrderEditForm({ code, initial, changeLogs = [] }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogOption[] | null>(null);
  const [catalogQuery, setCatalogQuery] = useState("");

  const [status, setStatus] = useState(initial.status);
  const [deliveryMethod, setDeliveryMethod] = useState(
    initial.deliveryMethod ?? "NONE"
  );
  const [shippingAddress, setShippingAddress] = useState(
    initial.shippingAddress ?? ""
  );
  const [shippingCost, setShippingCost] = useState(
    initial.shippingCost?.toString() ?? ""
  );
  const [depositAmount, setDepositAmount] = useState(
    initial.depositAmount?.toString() ?? ""
  );
  const [discountAmount, setDiscountAmount] = useState(
    initial.discountAmount?.toString() ?? ""
  );
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountReason, setDiscountReason] = useState(
    initial.discountReason ?? ""
  );
  const [totalOverride, setTotalOverride] = useState(initial.totalOverride);
  const [total, setTotal] = useState(initial.total?.toString() ?? "");
  const [adminNotes, setAdminNotes] = useState(initial.adminNotes ?? "");
  const [items, setItems] = useState<Item[]>(initial.items);
  const [freeName, setFreeName] = useState("");
  const [freePrice, setFreePrice] = useState("");

  const itemsTotal = useMemo(
    () =>
      sumItemsTotal(
        items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice }))
      ),
    [items]
  );

  const shippingNum =
    deliveryMethod === "ENVIO"
      ? shippingCost === ""
        ? null
        : Number(shippingCost)
      : 0;
  const discountNum =
    discountAmount === ""
      ? 0
      : Math.min(Number(discountAmount), itemsTotal ?? 0);

  const calculatedTotal = calcOrderTotal({
    itemsTotal,
    shippingCost: shippingNum,
    discountAmount: discountNum,
    totalOverride: false,
  });

  const effectiveTotal = totalOverride
    ? total === ""
      ? null
      : Number(total)
    : calculatedTotal;

  const remaining = useMemo(
    () =>
      calcRemaining(
        effectiveTotal,
        depositAmount === "" ? null : Number(depositAmount)
      ),
    [effectiveTotal, depositAmount]
  );

  async function ensureCatalog() {
    if (catalog) return catalog;
    const products = await listAdminProducts({ active: "ACTIVE" });
    const options = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price ? Number(p.price) : null,
      categoryId: p.categoryId,
      categoryName: p.category.name,
    }));
    setCatalog(options);
    return options;
  }

  function onDiscountPercentChange(raw: string) {
    if (raw === "") {
      setDiscountPercent("");
      setDiscountAmount("");
      return;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;

    const pct = Math.min(100, Math.max(0, parsed));
    setDiscountPercent(parsed > 100 || parsed < 0 ? String(pct) : raw);

    if (itemsTotal == null) {
      setDiscountAmount("");
      return;
    }

    const amount = Math.round(((itemsTotal * pct) / 100) * 100) / 100;
    setDiscountAmount(String(amount));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await adminUpdateOrder({
        code,
        status: status as never,
        deliveryMethod:
          deliveryMethod === "NONE"
            ? null
            : (deliveryMethod as "RETIRO" | "ENVIO"),
        shippingAddress: shippingAddress || null,
        shippingCost: shippingNum,
        itemsTotal,
        total: effectiveTotal,
        depositAmount: depositAmount === "" ? null : Number(depositAmount),
        discountAmount: discountNum > 0 ? discountNum : null,
        discountReason: discountReason || null,
        totalOverride,
        adminNotes: adminNotes || null,
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          categoryId: i.categoryId,
          categoryName: i.categoryName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Pedido actualizado");
      router.refresh();
    });
  }

  const filteredCatalog =
    catalog?.filter((p) =>
      p.name.toLowerCase().includes(catalogQuery.toLowerCase())
    ) ?? [];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Estado y entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Entrega</Label>
              <Select
                value={deliveryMethod}
                onValueChange={(value) => {
                  setDeliveryMethod(value);
                  if (value !== "ENVIO") setShippingCost("0");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sin definir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sin definir</SelectItem>
                  <SelectItem value="RETIRO">Retiro</SelectItem>
                  <SelectItem value="ENVIO">Envío</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {deliveryMethod === "ENVIO" ? (
            <div className="space-y-2">
              <Label htmlFor="shipping-address">Dirección de envío</Label>
              <Textarea
                id="shipping-address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={2}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ítems</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li
                key={item.id ?? `new-${idx}`}
                className="grid grid-cols-[1fr_70px_90px_auto] items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span>{item.productName}</span>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => {
                    const quantity = Number(e.target.value);
                    setItems((prev) =>
                      prev.map((it, i) => (i === idx ? { ...it, quantity } : it))
                    );
                  }}
                  className="h-8 px-2"
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Precio"
                  value={item.unitPrice ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const unitPrice = raw === "" ? null : Number(raw);
                    setItems((prev) =>
                      prev.map((it, i) =>
                        i === idx ? { ...it, unitPrice } : it
                      )
                    );
                  }}
                  className="h-8 px-2"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>

          <div className="space-y-2 rounded-xl border border-dashed border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Agregar del catálogo
            </p>
            <Input
              type="search"
              placeholder="Buscar producto…"
              value={catalogQuery}
              onFocus={() => void ensureCatalog()}
              onChange={(e) => {
                setCatalogQuery(e.target.value);
                void ensureCatalog();
              }}
            />
            {catalogQuery && filteredCatalog.length > 0 ? (
              <ul className="max-h-40 overflow-auto rounded-lg border border-border bg-card text-sm">
                {filteredCatalog.slice(0, 8).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted"
                      onClick={() => {
                        setItems((prev) => [
                          ...prev,
                          {
                            productId: p.id,
                            productName: p.name,
                            categoryId: p.categoryId,
                            categoryName: p.categoryName,
                            quantity: 1,
                            unitPrice: p.price,
                          },
                        ]);
                        setCatalogQuery("");
                      }}
                    >
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">
                        {formatMoneyARS(p.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="pt-2 text-xs font-medium text-muted-foreground">
              Ítem libre
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                type="text"
                placeholder="Nombre"
                value={freeName}
                onChange={(e) => setFreeName(e.target.value)}
                className="min-w-40 flex-1"
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Precio"
                value={freePrice}
                onChange={(e) => setFreePrice(e.target.value)}
                className="w-28"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!freeName.trim()) return;
                  setItems((prev) => [
                    ...prev,
                    {
                      productName: freeName.trim(),
                      quantity: 1,
                      unitPrice: freePrice === "" ? null : Number(freePrice),
                    },
                  ]);
                  setFreeName("");
                  setFreePrice("");
                }}
              >
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Montos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField
              label="Costo de envío"
              value={shippingCost}
              onChange={setShippingCost}
              disabled={deliveryMethod !== "ENVIO"}
            />
            <MoneyField
              label="Seña"
              value={depositAmount}
              onChange={setDepositAmount}
            />
            <MoneyField
              label="Descuento (monto)"
              value={discountAmount}
              onChange={setDiscountAmount}
            />
            <div className="space-y-2">
              <Label htmlFor="discount-pct">Descuento %</Label>
              <Input
                id="discount-pct"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={discountPercent}
                onChange={(e) => onDiscountPercentChange(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="discount-reason">Motivo del descuento</Label>
              <Input
                id="discount-reason"
                type="text"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="total-override"
              checked={totalOverride}
              onCheckedChange={(checked) => {
                setTotalOverride(checked);
                if (checked && calculatedTotal != null) {
                  setTotal(String(calculatedTotal));
                }
              }}
            />
            <Label htmlFor="total-override">Fijar total manualmente</Label>
          </div>
          {totalOverride ? (
            <div className="space-y-2">
              <MoneyField label="Total manual" value={total} onChange={setTotal} />
              {calculatedTotal != null && total !== "" ? (
                <p className="text-xs text-amber-800">
                  Diferencia vs calculado:{" "}
                  {formatMoneyARS(Number(total) - calculatedTotal)}
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderMoneySummary
            itemsTotal={itemsTotal}
            shippingCost={shippingNum}
            discountAmount={discountNum > 0 ? discountNum : null}
            discountReason={discountReason || null}
            total={effectiveTotal}
            depositAmount={depositAmount === "" ? null : Number(depositAmount)}
            remaining={remaining}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas e historial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-notes">Notas internas</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>

          {changeLogs.length > 0 ? (
            <ul className="space-y-2 text-xs text-muted-foreground">
              {changeLogs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-lg border border-border px-3 py-2"
                >
                  <span className="font-medium text-foreground">
                    {log.summary}
                  </span>
                  {" · "}
                  {log.adminEmail}
                  {" · "}
                  {new Date(log.createdAt).toLocaleString("es-AR")}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <Button type="submit" disabled={pending || items.length === 0} size="lg">
        {pending ? (
          <>
            <Spinner />
            Guardando…
          </>
        ) : (
          "Guardar cambios"
        )}
      </Button>
    </form>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
