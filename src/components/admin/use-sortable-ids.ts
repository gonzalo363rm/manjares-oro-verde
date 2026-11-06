"use client";

import { useEffect, useRef, useState, useTransition } from "react";

type ReorderFn = (
  raw: { orderedIds: string[] }
) => Promise<{ ok: true } | { ok: false; error: string }>;

function syncKey<T extends { id: string; active?: boolean }>(items: T[]) {
  return items
    .map((i) => `${i.id}:${i.active === undefined ? "" : i.active ? "1" : "0"}`)
    .join(",");
}

export function useSortableIds<T extends { id: string; active?: boolean }>(
  initialItems: T[],
  reorder: ReorderFn
) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const key = syncKey(initialItems);
  const initialRef = useRef(initialItems);
  initialRef.current = initialItems;

  useEffect(() => {
    setItems(initialRef.current);
  }, [key]);

  function onDragStart(index: number) {
    dragFrom.current = index;
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragOver !== index) setDragOver(index);
  }

  function onDragEnd() {
    dragFrom.current = null;
    setDragOver(null);
  }

  function onDrop(index: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (from == null || from === index) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(index, 0, moved);
    setItems(next);
    setError(null);

    const snapshot = initialRef.current;
    startTransition(async () => {
      const result = await reorder({ orderedIds: next.map((i) => i.id) });
      if (!result.ok) {
        setItems(snapshot);
        setError(result.error);
      }
    });
  }

  return {
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
  };
}
