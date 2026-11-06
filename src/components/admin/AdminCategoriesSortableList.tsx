"use client";

import Link from "next/link";
import { IoMenu } from "react-icons/io5";

import {
  deleteCategoryFormAction,
  reorderCategories,
} from "@/actions/categories";
import { useSortableIds } from "@/components/admin/use-sortable-ids";
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

export type AdminCategoryRow = {
  id: string;
  name: string;
  active: boolean;
  productCount: number;
};

type Props = {
  categories: AdminCategoryRow[];
};

export function AdminCategoriesSortableList({ categories }: Props) {
  const {
    items,
    error,
    pending,
    dragOver,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
  } = useSortableIds(categories, reorderCategories);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Arrastrá las filas para cambiar el orden del catálogo.
      </p>
      <div
        className={`overflow-hidden rounded-2xl border border-border bg-card ${
          pending ? "opacity-70" : ""
        }`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Nombre</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c, index) => (
              <TableRow
                key={c.id}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={() => onDrop(index)}
                className={
                  dragOver === index ? "bg-primary/5 ring-1 ring-primary/30" : ""
                }
              >
                <TableCell
                  className="w-10 cursor-grab px-2 active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", c.id);
                    onDragStart(index);
                  }}
                  onDragEnd={onDragEnd}
                >
                  <IoMenu
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="sr-only">Arrastrar {c.name}</span>
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.productCount}</TableCell>
                <TableCell>
                  <Badge variant={c.active ? "default" : "outline"}>
                    {c.active ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/categorias/${c.id}`}>Editar</Link>
                    </Button>
                    {c.productCount === 0 ? (
                      <form action={deleteCategoryFormAction.bind(null, c.id)}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          Borrar
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
