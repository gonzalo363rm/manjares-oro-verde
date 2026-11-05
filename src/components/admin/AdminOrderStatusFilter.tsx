"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-status";

type Props = {
  status: string;
};

export function AdminOrderStatusFilter({ status }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(status || "ALL");

  function apply() {
    if (!selected || selected === "ALL") {
      router.push("/admin/pedidos");
      return;
    }
    router.push(`/admin/pedidos?status=${selected}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Label htmlFor="order-status" className="sr-only">
        Estado
      </Label>
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger id="order-status" className="w-[220px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          {ORDER_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" variant="secondary" onClick={apply}>
        Filtrar
      </Button>
    </div>
  );
}
