import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPickupPointsLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-2 mb-6 h-8 w-48" />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-0"
            >
              <Skeleton className="size-5" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <Skeleton className="mb-3 h-5 w-28" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
