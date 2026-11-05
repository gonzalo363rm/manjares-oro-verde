import {
  discountPercent,
  formatMoneyARS,
  type MoneyLike,
} from "@/lib/order-money";

type Props = {
  itemsTotal: MoneyLike;
  shippingCost?: MoneyLike;
  discountAmount?: MoneyLike;
  discountReason?: string | null;
  total: MoneyLike;
  depositAmount?: MoneyLike;
  remaining?: MoneyLike;
  className?: string;
};

export function OrderMoneySummary({
  itemsTotal,
  shippingCost,
  discountAmount,
  discountReason,
  total,
  depositAmount,
  remaining,
  className,
}: Props) {
  const pct = discountPercent(discountAmount, itemsTotal);
  const hasDiscount = (Number(discountAmount) || 0) > 0;

  let discountLabel = "Descuento";
  if (hasDiscount) {
    const parts: string[] = [];
    if (discountReason?.trim()) parts.push(discountReason.trim());
    if (pct != null) parts.push(`${pct % 1 === 0 ? pct : pct.toFixed(1)}%`);
    discountLabel =
      parts.length > 0 ? `Descuento (${parts.join(" · ")})` : "Descuento";
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-card text-sm ${className ?? ""}`}
    >
      <div className="space-y-2.5 px-4 py-3.5">
        <MoneyRow label="Subtotal productos" value={formatMoneyARS(itemsTotal)} />
        <MoneyRow label="Envío" value={formatMoneyARS(shippingCost)} />
        {hasDiscount ? (
          <MoneyRow
            label={discountLabel}
            value={`− ${formatMoneyARS(discountAmount)}`}
            muted
          />
        ) : null}
      </div>

      <div className="border-t border-border bg-muted/40 px-4 py-3.5">
        <MoneyRow
          label="Total"
          value={formatMoneyARS(total)}
          strong
          large
        />
      </div>

      <div className="space-y-2.5 border-t border-border px-4 py-3.5">
        <MoneyRow label="Seña" value={formatMoneyARS(depositAmount)} />
        <MoneyRow
          label="Restante por pagar"
          value={formatMoneyARS(remaining)}
          strong
          accent
        />
      </div>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  strong,
  large,
  muted,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  large?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className={
          accent
            ? "font-medium text-foreground"
            : "text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={[
          "tabular-nums",
          large ? "text-base" : "",
          strong ? "font-semibold text-foreground" : "text-foreground",
          muted ? "text-emerald-800" : "",
          accent ? "font-semibold text-primary" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
