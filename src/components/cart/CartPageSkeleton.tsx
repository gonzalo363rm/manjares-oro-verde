import { Skeleton } from "@/components/ui/skeleton";

export function CartPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-6" aria-busy="true">
      <div className="mt-3 space-y-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-6 w-72 max-w-full" />
      </div>

      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-8 w-14" />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-36" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
