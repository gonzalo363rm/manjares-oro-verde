"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { useCartStore } from "@/store/cart/cart-store";

export function CartSync() {
  const { status } = useSession();
  const mode = useCartStore((s) => s.mode);
  const hydrated = useCartStore((s) => s.hydrated);
  const mergeOnLogin = useCartStore((s) => s.mergeOnLogin);
  const enterGuestMode = useCartStore((s) => s.enterGuestMode);
  const reloadFromServer = useCartStore((s) => s.reloadFromServer);
  const prevStatus = useRef(status);

  useEffect(() => {
    if (!hydrated) return;

    if (status === "authenticated" && mode !== "user") {
      void mergeOnLogin();
    } else if (status === "unauthenticated" && mode === "user") {
      enterGuestMode();
    }

    prevStatus.current = status;
  }, [status, mode, hydrated, mergeOnLogin, enterGuestMode]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      if (useCartStore.getState().mode !== "user") return;
      void reloadFromServer();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reloadFromServer]);

  return null;
}
