export const SITE_NAME = "Manjares de Oro Verde";

export const SITE_TAGLINE = "Mesas dulces con sabor casero";

export const SITE_TITLE =
  "Manjares de Oro Verde — Mesas dulces en Oro Verde y Paraná";

export const SITE_DESCRIPTION =
  "Mesas dulces para cumpleaños, casamientos y eventos en Oro Verde, Paraná y Santa Fe. Pedí por WhatsApp.";

/** Sedes / bases del negocio (schema.org location[]). */
export const SITE_LOCATIONS = [
  {
    name: "Paraná",
    addressLocality: "Paraná",
    addressRegion: "Entre Ríos",
    addressCountry: "AR",
  },
  {
    name: "Oro Verde",
    addressLocality: "Oro Verde",
    addressRegion: "Entre Ríos",
    addressCountry: "AR",
  },
] as const;

export const SITE_FOOTER_BLURB =
  "Mesas dulces personalizadas con ingredientes de calidad. Pedidos por WhatsApp para Oro Verde, Paraná, Santa Fe y zonas aledañas.";

export const SITE_SERVICE_AREA =
  "Oro Verde, Paraná y Santa Fe";

/** Lugares para schema.org / keywords locales. */
export const SITE_SERVICE_PLACES = [
  "Oro Verde",
  "Paraná",
  "Santa Fe",
  "Colonia Avellaneda",
  "Colonia Ensayo",
  "Entre Ríos",
] as const;

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/manjaresov/",
  facebook:
    "https://www.facebook.com/p/Manjares-de-Oro-Verde-100063712903909/",
} as const;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
