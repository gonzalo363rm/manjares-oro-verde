"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io5";

import { createOrder } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { hashCartPayload } from "@/lib/cart-hash";
import {
  getPendingCartHash,
  getPendingOrderCode,
  setAwaitingConfirm,
} from "@/lib/order-pending-ls";
import { useCartStore } from "@/store/cart/cart-store";

export const LS_ORDER_DRAFT = "manjares-order-draft-v1";

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
  onValidationError?: (field: "contactName" | "contactPhone") => void;
};

export function saveOrderDraft(event: EventFormValues) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_ORDER_DRAFT, JSON.stringify(event));
  } catch {
    // ignore quota / private mode
  }
}

export function consumeOrderDraft(): EventFormValues | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_ORDER_DRAFT);
    if (!raw) return null;
    localStorage.removeItem(LS_ORDER_DRAFT);
    const parsed = JSON.parse(raw) as EventFormValues;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function WhatsAppOrderButton({
  event,
  className,
  label = "Pedir por WhatsApp",
  onValidationError,
}: Props) {
  const { status } = useSession();
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }
    if (!event.contactName.trim()) {
      setError("Completá tu nombre");
      onValidationError?.("contactName");
      return;
    }
    if (!event.contactPhone.trim()) {
      setError("Completá tu teléfono");
      onValidationError?.("contactPhone");
      return;
    }

    if (status !== "authenticated") {
      saveOrderDraft(event);
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent("/carrito?resume=1")}`
      );
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

      setAwaitingConfirm(result.code, cartHash);
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
