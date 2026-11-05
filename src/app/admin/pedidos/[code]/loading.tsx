import { Skeleton } from "@/components/ui/skeleton";

function FormCardSkeleton({
  titleWidth = "8rem",
  rows = 3,
}: {
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-5" style={{ width: titleWidth }} />
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPedidoDetailLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <Skeleton className="h-4 w-36" />

      <header className="mt-4 mb-6 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-4 w-28" />
      </header>

      <div className="space-y-5">
        <FormCardSkeleton titleWidth="9rem" rows={2} />
        <FormCardSkeleton titleWidth="4rem" rows={3} />
        <FormCardSkeleton titleWidth="7rem" rows={3} />
        <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
      </div>
    </main>
  );
}
