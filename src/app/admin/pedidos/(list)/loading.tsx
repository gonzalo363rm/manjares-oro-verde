import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPedidosListLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-[220px]" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-border px-4 py-4 last:border-0"
          >
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="hidden h-4 w-36 sm:block" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
            <Skeleton className="ml-auto h-8 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </main>
  );
}
