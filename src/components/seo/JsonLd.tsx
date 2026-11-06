import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SERVICE_PLACES,
  SOCIAL_LINKS,
  getSiteUrl,
} from "@/lib/site";
import { getWhatsAppChatUrl, getWhatsAppNumber } from "@/lib/whatsapp";

export function JsonLd() {
  const base = getSiteUrl();
  const whatsapp = getWhatsAppNumber();
  const whatsappUrl = getWhatsAppChatUrl();
  const sameAs = [
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.facebook,
    ...(whatsappUrl ? [whatsappUrl] : []),
  ];

  const data = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: base,
    image: `${base}/branding/logo.jpg`,
    logo: `${base}/branding/logo.jpg`,
    areaServed: SITE_SERVICE_PLACES.map((name) => ({
      "@type": "Place",
      name,
    })),
    sameAs,
    ...(whatsapp
      ? {
          telephone: `+${whatsapp}`,
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: `+${whatsapp}`,
            availableLanguage: ["Spanish"],
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
