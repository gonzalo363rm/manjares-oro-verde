"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMenu } from "react-icons/io5";

import {
  deleteProductFormAction,
  reorderProducts,
  setProductActive,
} from "@/actions/products";
import { useSortableIds } from "@/components/admin/use-sortable-ids";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoneyARS } from "@/lib/order-money";

export type AdminProductRow = {
  id: string;
  name: string;
  categoryName: string;
  price: number | null;
  active: boolean;
  metaSyncStatus: string;
  canDelete: boolean;
  thumb: { publicId: string; version: number } | null;
};

type Props = {
  products: AdminProductRow[];
};

export function AdminProductsSortableList({ products }: Props) {
  const router = useRouter();
  const {
    items,
    setItems,
    error,
    setError,
    pending,
    startTransition,
    dragOver,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
  } = useSortableIds(products, reorderProducts);

  function toggleActive(product: AdminProductRow) {
    const nextActive = !product.active;
    const snapshot = items;
    setItems(
      items.map((item) =>
        item.id === product.id ? { ...item, active: nextActive } : item
      )
    );
    setError(null);

    startTransition(async () => {
      const result = await setProductActive(product.id, nextActive);
      if (!result.ok) {
        setItems(snapshot);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Arrastrá las filas para cambiar el orden. Con filtros activos, el orden
        aplica a la lista visible.
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
              <TableHead className="w-14" />
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Sync</TableHead>
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
                <TableCell className="w-14 pr-0">
                  <div className="relative size-11 overflow-hidden rounded-lg border border-border bg-muted">
                    {p.thumb ? (
                      <CloudinaryImage
                        publicId={p.thumb.publicId}
                        version={p.thumb.version}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.categoryName}</TableCell>
                <TableCell>{formatMoneyARS(p.price)}</TableCell>
                <TableCell>
                  <Badge variant={p.active ? "default" : "outline"}>
                    {p.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{p.metaSyncStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/productos/${p.id}`}>Editar</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(p)}
                    >
                      {p.active ? "Desactivar" : "Activar"}
                    </Button>
                    {p.canDelete ? (
                      <form action={deleteProductFormAction.bind(null, p.id)}>
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
