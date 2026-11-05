/** Client-only localStorage keys for post-WA flow. */

export const LS_AWAITING_CONFIRM = "manjares-awaiting-order-confirm";
export const LS_PENDING_CODE = "manjares-pending-order-code";
export const LS_PENDING_HASH = "manjares-pending-cart-hash";

export function setAwaitingConfirm(code: string, cartHash: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_AWAITING_CONFIRM, "1");
  localStorage.setItem(LS_PENDING_CODE, code);
  localStorage.setItem(LS_PENDING_HASH, cartHash);
}

export function clearAwaitingConfirm() {
  if (typeof window === "undefined") return;
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

export function isAwaitingConfirm(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_AWAITING_CONFIRM) === "1";
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
