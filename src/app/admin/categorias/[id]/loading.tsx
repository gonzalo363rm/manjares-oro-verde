import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriaEditLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 mb-6 h-8 w-48" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-4 p-4">
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
          <div className="flex gap-3">
            <Skeleton className="size-28 rounded-xl" />
            <Skeleton className="size-28 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
