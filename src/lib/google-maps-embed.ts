/**
 * Normaliza un pegado de Google Maps (URL o iframe) a un src de embed seguro.
 */
export function normalizeGoogleMapsEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromIframe = trimmed.match(/src=["']([^"']+)["']/i)?.[1];
  const candidate = (fromIframe ?? trimmed).trim();

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  const allowedHost =
    host === "www.google.com" ||
    host === "maps.google.com" ||
    host === "google.com" ||
    host.endsWith(".google.com");

  if (!allowedHost) return null;

  const path = url.pathname.toLowerCase();
  const isEmbed =
    path.includes("/maps/embed") ||
    url.searchParams.get("output") === "embed";

  if (!isEmbed && path.includes("/maps")) {
    // Pegó un link de Maps normal: intentar forzar embed vía q=
    const q =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      decodeURIComponent(path.replace(/^\/maps\/place\//, "").split("/")[0] ?? "");
    if (q) {
      return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
    return null;
  }

  if (!isEmbed) return null;

  return url.toString();
}
