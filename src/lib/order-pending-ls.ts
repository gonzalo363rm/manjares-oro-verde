/** Client-only localStorage keys for pending order reuse. */

export const LS_PENDING_CODE = "manjares-pending-order-code";
export const LS_PENDING_HASH = "manjares-pending-cart-hash";

/** @deprecated Kept to clear legacy post-WA confirm flag. */
export const LS_AWAITING_CONFIRM = "manjares-awaiting-order-confirm";

export function setPendingOrderMeta(code: string, cartHash: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_PENDING_CODE, code);
  localStorage.setItem(LS_PENDING_HASH, cartHash);
  localStorage.removeItem(LS_AWAITING_CONFIRM);
}

export function getPendingOrderCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_PENDING_CODE);
}

export function getPendingCartHash(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_PENDING_HASH);
}

export function clearPendingOrderMeta() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_AWAITING_CONFIRM);
  localStorage.removeItem(LS_PENDING_CODE);
  localStorage.removeItem(LS_PENDING_HASH);
  try {
    localStorage.removeItem("manjares-claim-after-login");
  } catch {
    // ignore
  }
}
