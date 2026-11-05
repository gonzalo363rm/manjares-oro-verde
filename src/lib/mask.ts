/** Public order view: hide full contact name. */
export function maskContactName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Cliente";
  if (parts.length === 1) {
    const first = parts[0]!;
    return first.length <= 1 ? "*" : `${first[0]}***`;
  }
  return `${parts[0]} ${parts[parts.length - 1]![0]}.`;
}

/**
 * Keep only barrio/localidad-ish last segment of an address.
 * e.g. "Av. Corrientes 1234, Palermo, CABA" → "Palermo, CABA"
 */
export function maskShippingAddress(address: string | null | undefined): string | null {
  if (!address?.trim()) return null;
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return "Zona a confirmar";
  return parts.slice(-2).join(", ");
}
