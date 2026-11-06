import { listPickupPoints } from "@/actions/pickup-points";
import { AdminPickupPointsSortableList } from "@/components/admin/AdminPickupPointsSortableList";
import { PickupPointForm } from "@/components/admin/PickupPointForm";
import { TextLink } from "@/components/ui/TextLink";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Puntos de retiro | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPickupPointsPage() {
  const points = await listPickupPoints();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <TextLink href="/admin" icon="back">
        Admin
      </TextLink>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Puntos de retiro</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {points.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Todavía no hay puntos. Agregá el primero con el formulario.
          </p>
        ) : (
          <AdminPickupPointsSortableList
            points={points.map((p) => ({
              id: p.id,
              name: p.name,
              address: p.address,
              active: p.active,
            }))}
          />
        )}

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">Nuevo punto</h2>
          <PickupPointForm />
        </div>
      </div>
    </main>
  );
}
