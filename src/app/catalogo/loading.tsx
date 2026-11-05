import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogoLoading() {
  return (
    <div className="page-gutter space-y-6 py-8">
      <header className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-56" />
      </header>
      <div className="-mx-1 flex gap-1 overflow-hidden px-1 pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-md" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-[75%]" />
              <Skeleton className="h-3 w-24" />
              <div className="flex items-center justify-between gap-2 pt-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-[4.75rem] rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
