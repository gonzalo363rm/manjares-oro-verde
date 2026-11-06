import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriasListLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-2 mb-6 h-8 w-40" />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 border-b border-border px-4 py-4 last:border-0"
            >
              <Skeleton className="size-5 shrink-0" />
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-4 w-10 shrink-0" />
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              <Skeleton className="ml-auto h-8 w-16 shrink-0" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <Skeleton className="mb-3 h-5 w-36" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="aspect-square w-full max-w-[7rem] rounded-xl" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
