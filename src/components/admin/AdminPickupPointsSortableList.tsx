"use client";

import Link from "next/link";
import { IoMenu } from "react-icons/io5";

import {
  deletePickupPointFormAction,
  reorderPickupPoints,
} from "@/actions/pickup-points";
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

export type AdminPickupPointRow = {
  id: string;
  name: string;
  address: string;
  active: boolean;
};

type Props = {
  points: AdminPickupPointRow[];
};

export function AdminPickupPointsSortableList({ points }: Props) {
  const {
    items,
    error,
    pending,
    dragOver,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
  } = useSortableIds(points, reorderPickupPoints);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Arrastrá las filas para el orden en la home.
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
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p, index) => (
              <TableRow
                key={p.id}
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
                    e.dataTransfer.setData("text/plain", p.id);
                    onDragStart(index);
                  }}
                  onDragEnd={onDragEnd}
                >
                  <IoMenu
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="sr-only">Arrastrar {p.name}</span>
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="max-w-[14rem] truncate text-muted-foreground">
                  {p.address || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={p.active ? "default" : "outline"}>
                    {p.active ? "Visible" : "Oculto"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/puntos-retiro/${p.id}`}>Editar</Link>
                    </Button>
                    <form action={deletePickupPointFormAction.bind(null, p.id)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        Borrar
                      </Button>
                    </form>
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
