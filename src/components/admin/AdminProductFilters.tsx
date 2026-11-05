"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = { id: string; name: string };

type Props = {
  categories: CategoryOption[];
  categoryId?: string;
  active: "ALL" | "ACTIVE" | "INACTIVE";
};

export function AdminProductFilters({
  categories,
  categoryId = "ALL",
  active,
}: Props) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(
    categoryId || "ALL"
  );
  const [selectedActive, setSelectedActive] = useState(active);

  function apply() {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "ALL") {
      params.set("categoryId", selectedCategory);
    }
    if (selectedActive !== "ALL") {
      params.set("active", selectedActive);
    }
    const qs = params.toString();
    router.push(qs ? `/admin/productos?${qs}` : "/admin/productos");
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedActive}
        onValueChange={(v) =>
          setSelectedActive(v as "ALL" | "ACTIVE" | "INACTIVE")
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          <SelectItem value="ACTIVE">Activos</SelectItem>
          <SelectItem value="INACTIVE">Inactivos</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" variant="secondary" onClick={apply}>
        Filtrar
      </Button>
    </div>
  );
}
