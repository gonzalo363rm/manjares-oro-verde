import { notFound } from "next/navigation";

import { listPickupPoints } from "@/actions/pickup-points";
import { PickupPointForm } from "@/components/admin/PickupPointForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextLink } from "@/components/ui/TextLink";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Editar punto de retiro | Admin",
  robots: { index: false, follow: false },
};

export default async function EditPickupPointPage({ params }: Props) {
  const { id } = await params;
  const points = await listPickupPoints();
  const point = points.find((p) => p.id === id);
  if (!point) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <TextLink href="/admin/puntos-retiro" icon="back">
        Puntos de retiro
      </TextLink>
      <h1 className="mt-2 mb-6 text-2xl font-bold">Editar punto</h1>
      <Card>
        <CardHeader>
          <CardTitle>{point.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <PickupPointForm
            initial={{
              id: point.id,
              name: point.name,
              address: point.address,
              description: point.description,
              mapEmbedUrl: point.mapEmbedUrl,
              active: point.active,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
