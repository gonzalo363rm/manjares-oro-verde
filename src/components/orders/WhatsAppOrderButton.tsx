"use client";

import { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io5";

import { createOrder } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { hashCartPayload } from "@/lib/cart-hash";
import {
  getPendingCartHash,
  getPendingOrderCode,
  setPendingOrderMeta,
} from "@/lib/order-pending-ls";
import { useCartStore } from "@/store/cart/cart-store";

export type EventFormValues = {
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  eventDate?: string;
  eventType?: string;
  guests?: number;
  comments?: string;
};

type Props = {
  event: EventFormValues;
  className?: string;
  label?: string;
};

export function WhatsAppOrderButton({
  event,
  className,
  label = "Pedir por WhatsApp",
}: Props) {
  const cart = useCartStore((s) => s.cart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    const waWindow = window.open("about:blank", "_blank");

    const cartHash = hashCartPayload({
      items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
      contactName: event.contactName,
      contactPhone: event.contactPhone,
      contactEmail: event.contactEmail ?? null,
      eventDate: event.eventDate ?? null,
      eventType: event.eventType ?? null,
      guests: event.guests ?? null,
      comments: event.comments ?? null,
    });

    const existingCode =
      getPendingCartHash() === cartHash ? getPendingOrderCode() : null;

    setLoading(true);
    try {
      const result = await createOrder({
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        contactName: event.contactName,
        contactPhone: event.contactPhone,
        contactEmail: event.contactEmail || null,
        eventDate: event.eventDate ?? null,
        eventType: event.eventType ?? null,
        guests: event.guests ?? null,
        comments: event.comments ?? null,
        cartHash,
        existingCode,
      });

      if (!result.ok) {
        waWindow?.close();
        setError(result.error);
        return;
      }

      setPendingOrderMeta(result.code, cartHash);
      if (waWindow) {
        waWindow.location.href = result.waUrl;
      } else {
        window.location.href = result.waUrl;
      }
    } catch {
      waWindow?.close();
      setError("No se pudo crear el pedido. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        className={className ?? "cta-pulse relative z-0 w-full"}
        disabled={loading}
        onClick={() => void handleClick()}
      >
        {loading ? (
          <>
            <Spinner />
            Preparando pedido…
          </>
        ) : (
          <>
            <IoLogoWhatsapp className="size-5" aria-hidden />
            {label}
          </>
        )}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
