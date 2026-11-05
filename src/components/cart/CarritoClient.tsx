"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoAdd, IoRemove } from "react-icons/io5";

import { getMyContact } from "@/actions/contact";
import { CartPageSkeleton } from "@/components/cart/CartPageSkeleton";
import { WhatsAppInquiryButton } from "@/components/orders/WhatsAppInquiryButton";
import {
  consumeOrderDraft,
  WhatsAppOrderButton,
} from "@/components/orders/WhatsAppOrderButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TextLink } from "@/components/ui/TextLink";
import { Title } from "@/components/ui/Title";
import {
  DEFAULT_EVENT_TYPE,
  EVENT_TYPES,
  isKnownEventType,
} from "@/lib/event-types";
import { formatMoneyARS, sumItemsTotal } from "@/lib/order-money";
import { useCartStore } from "@/store/cart/cart-store";

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function CarritoClient() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const cart = useCartStore((s) => s.cart);
  const cartHydrated = useCartStore((s) => s.hydrated);
  const cartSyncing = useCartStore((s) => s.syncing);
  const cartMode = useCartStore((s) => s.mode);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeProduct = useCartStore((s) => s.removeProduct);
  const clearCart = useCartStore((s) => s.clearCart);

  const cartReady =
    cartHydrated &&
    status !== "loading" &&
    !cartSyncing &&
    !(status === "authenticated" && cartMode !== "user");

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTypeSelect, setEventTypeSelect] =
    useState<string>(DEFAULT_EVENT_TYPE);
  const [eventTypeOther, setEventTypeOther] = useState("");
  const [guests, setGuests] = useState<string>("");
  const [comments, setComments] = useState("");
  const [resumeHint, setResumeHint] = useState(false);
  const draftApplied = useRef(false);
  const contactPrefillDone = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const cartSubtotal = useMemo(
    () =>
      sumItemsTotal(
        cart.map((item) => ({ quantity: item.quantity, unitPrice: item.price }))
      ),
    [cart]
  );

  const resolvedEventType =
    eventTypeSelect === "Otro"
      ? eventTypeOther.trim() || undefined
      : eventTypeSelect || undefined;

  useEffect(() => {
    if (draftApplied.current) return;
    draftApplied.current = true;

    const draft = consumeOrderDraft();
    if (draft) {
      setContactName(draft.contactName ?? "");
      setContactPhone(draft.contactPhone ?? "");
      setContactEmail(draft.contactEmail ?? "");
      setEventDate(draft.eventDate ?? "");
      if (draft.eventType) {
        if (isKnownEventType(draft.eventType) && draft.eventType !== "Otro") {
          setEventTypeSelect(draft.eventType);
        } else if (draft.eventType === DEFAULT_EVENT_TYPE) {
          setEventTypeSelect(DEFAULT_EVENT_TYPE);
        } else {
          setEventTypeSelect("Otro");
          setEventTypeOther(draft.eventType);
        }
      }
      setGuests(
        draft.guests != null && Number.isFinite(draft.guests)
          ? String(draft.guests)
          : ""
      );
      setComments(draft.comments ?? "");
    }

    if (searchParams.get("resume") === "1") {
      setResumeHint(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (contactPrefillDone.current) return;
    contactPrefillDone.current = true;

    void getMyContact().then((contact) => {
      if (!contact) return;
      setContactName((prev) => prev.trim() || contact.name);
      setContactPhone((prev) => prev.trim() || contact.phone);
      setContactEmail((prev) => prev.trim() || contact.email);
    });
  }, [status]);

  function focusMissingField(field: "contactName" | "contactPhone") {
    const el = field === "contactName" ? nameRef.current : phoneRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
  }

  if (!cartReady) {
    return <CartPageSkeleton />;
  }

  return (
    <div className="fade-in mx-auto max-w-3xl space-y-8 px-5 py-6">
      <Title title="Carrito" subtitle="Revisá tu pedido y enviálo por WhatsApp" />

      {resumeHint ? (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          Ya iniciaste sesión. Tocá <strong>Pedir por WhatsApp</strong> para
          enviar el pedido.
        </p>
      ) : null}

      {cart.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Tu carrito está vacío.{" "}
          <TextLink href="/catalogo">Ver catálogo</TextLink>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {cart.map((item) => {
              const lineTotal =
                item.price != null ? item.price * item.quantity : null;
              return (
                <li
                  key={item.id}
                  className="card-lift flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoneyARS(item.price)}
                      {lineTotal != null && item.quantity > 1
                        ? ` · ${formatMoneyARS(lineTotal)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Restar"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <IoRemove />
                      </Button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Sumar"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <IoAdd />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeProduct(item.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-muted-foreground"
              onClick={() => clearCart()}
            >
              Limpiar carrito
            </Button>
            <p className="text-sm">
              <span className="text-muted-foreground">Subtotal: </span>
              <strong>{formatMoneyARS(cartSubtotal)}</strong>
            </p>
          </div>

          <section className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div>
              <h2 className="font-semibold">Datos del pedido</h2>
              {status !== "authenticated" ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Vas a necesitar iniciar sesión para enviar el pedido. Podés
                  completar los datos ahora; te pedimos login al tocar el botón.
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Contacto</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    ref={nameRef}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">
                    Teléfono de contacto{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    ref={phoneRef}
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="contact-email">
                    Email{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Detalles del encargo
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  No son obligatorios: solo nos ayudan a agilizar tu encargo.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-date">
                    Fecha{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    min={todayISODate()}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Tipo de evento{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>
                  <Select
                    value={eventTypeSelect}
                    onValueChange={setEventTypeSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elegí un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {eventTypeSelect === "Otro" ? (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="event-type-other">
                      ¿Cuál?{" "}
                      <span className="font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </Label>
                    <Input
                      id="event-type-other"
                      value={eventTypeOther}
                      onChange={(e) => setEventTypeOther(e.target.value)}
                      placeholder="Describí el tipo de evento"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="guests">
                    Número de personas{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">
                  Comentarios{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <WhatsAppOrderButton
              event={{
                contactName,
                contactPhone,
                contactEmail: contactEmail || undefined,
                eventDate: eventDate || undefined,
                eventType: resolvedEventType,
                guests: guests ? Number(guests) : undefined,
                comments: comments || undefined,
              }}
              onValidationError={focusMissingField}
            />
          </section>
        </>
      )}

      <div id="consulta">
        <WhatsAppInquiryButton />
      </div>
    </div>
  );
}
