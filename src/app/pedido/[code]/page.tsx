import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicOrderByCode } from "@/actions/orders";
import { OrderPublicCard } from "@/components/orders/OrderPublicCard";
import { TextLink } from "@/components/ui/TextLink";
import { displayOrderCode } from "@/lib/order-code";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Pedido ${displayOrderCode(code)} | Manjares de Oro Verde`,
    robots: { index: false, follow: false },
  };
}

export default async function PedidoPublicPage({ params }: Props) {
  const { code } = await params;
  const order = await getPublicOrderByCode(code);
  if (!order) notFound();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="mx-auto mb-6 max-w-2xl">
        <TextLink href="/" icon="back">
          Volver al inicio
        </TextLink>
      </div>
      <OrderPublicCard order={order} />
    </main>
  );
}
