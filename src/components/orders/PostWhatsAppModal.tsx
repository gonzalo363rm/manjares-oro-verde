"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { displayOrderCode } from "@/lib/order-code";
import {
  clearAwaitingConfirm,
  clearPendingOrderMeta,
  getPendingOrderCode,
  isAwaitingConfirm,
} from "@/lib/order-pending-ls";
import { useCartStore } from "@/store/cart/cart-store";

type Step = "ask" | "success";

export function PostWhatsAppModal() {
  const clearCart = useCartStore((s) => s.clearCart);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("ask");
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    function check() {
      if (document.visibilityState !== "visible") return;
      if (!isAwaitingConfirm()) return;
      setCode(getPendingOrderCode());
      setStep("ask");
      setOpen(true);
    }

    check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);

  function close() {
    setOpen(false);
    clearAwaitingConfirm();
  }

  function onNo() {
    close();
  }

  function onYes() {
    const pendingCode = getPendingOrderCode();
    setCode(pendingCode);
    clearCart();
    clearPendingOrderMeta();
    setStep("success");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else setOpen(true);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={step === "success"}
      >
        {step === "ask" ? (
          <>
            <DialogHeader>
              <DialogTitle>¿Realizaste el pedido?</DialogTitle>
              <DialogDescription>
                Te abrimos WhatsApp con el código{" "}
                <span className="font-mono font-medium text-foreground">
                  {code ? displayOrderCode(code) : ""}
                </span>
                . Contanos si enviaste el mensaje.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-stretch">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onNo}
              >
                No
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={onYes}
              >
                Sí
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>¡Pedido registrado!</DialogTitle>
              <DialogDescription>
                Te limpiamos el carrito. Podés ver tus pedidos en el historial y
                dejarnos una reseña cuando quieras.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              {code ? (
                <Button asChild>
                  <Link href={`/pedido/${code}`} onClick={close}>
                    Ver pedido {displayOrderCode(code)}
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="secondary">
                <Link href="/mis-pedidos" onClick={close}>
                  Ir al historial
                </Link>
              </Button>
              <Button type="button" variant="ghost" onClick={close}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
