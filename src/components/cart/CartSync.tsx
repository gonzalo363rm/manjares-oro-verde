"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { useCartStore } from "@/store/cart/cart-store";

type Props = {
  /** True when layout already seeded the cart from the server. */
  serverSeeded?: boolean;
};

export function CartSync({ serverSeeded = false }: Props) {
  const { status } = useSession();
  const mode = useCartStore((s) => s.mode);
  const hydrated = useCartStore((s) => s.hydrated);
  const mergeOnLogin = useCartStore((s) => s.mergeOnLogin);
  const enterGuestMode = useCartStore((s) => s.enterGuestMode);
  const reloadFromServer = useCartStore((s) => s.reloadFromServer);
  const didInitialUserLoad = useRef(serverSeeded);
  const mergeStarted = useRef(false);

  useEffect(() => {
    if (!hydrated) return;

    if (status === "authenticated" && mode !== "user") {
      if (mergeStarted.current) return;
      mergeStarted.current = true;
      void mergeOnLogin();
    } else if (status === "authenticated" && mode === "user") {
      mergeStarted.current = false;
      if (!didInitialUserLoad.current) {
        didInitialUserLoad.current = true;
        void reloadFromServer();
      }
    } else if (status === "unauthenticated" && mode === "user") {
      didInitialUserLoad.current = false;
      mergeStarted.current = false;
      enterGuestMode();
    }
  }, [
    status,
    mode,
    hydrated,
    mergeOnLogin,
    enterGuestMode,
    reloadFromServer,
  ]);

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
