import type { Metadata } from "next";

import { getCart } from "@/actions/cart";
import { auth } from "@/auth";
import { CartSeedProvider } from "@/components/cart/cart-seed-context";
import { CartSync } from "@/components/cart/CartSync";
import { PostWhatsAppModal } from "@/components/orders/PostWhatsAppModal";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { Footer } from "@/components/ui/Footer";
import { TopMenu } from "@/components/ui/TopMenu";
import { dmSans, inter } from "@/config/fonts";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  getSiteUrl,
} from "@/lib/site";

import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${SITE_NAME}`,
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "mesas dulces",
    "Manjares de Oro Verde",
    "alfajores",
    "eventos",
    "cumpleaños",
    "casamientos",
    "Oro Verde",
    "Paraná",
    "Santa Fe",
    "mesas dulces Santa Fe",
    "mesas dulces Paraná",
    "mesas dulces Oro Verde",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/branding/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/branding/logo.jpg",
        width: 1200,
        height: 1200,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/branding/logo.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let initialServerCart: Awaited<ReturnType<typeof getCart>>["items"] | null =
    null;

  if (session?.user?.id) {
    const cart = await getCart();
    if (cart.ok) initialServerCart = cart.items;
  }

  return (
    <html lang="es-AR">
      <body
        className={`${inter.className} ${dmSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <JsonLd />
        <SessionProvider>
          <CartSeedProvider initialServerCart={initialServerCart}>
            <main className="flex min-h-screen flex-col">
              <TopMenu />
              <div className="flex-1">{children}</div>
              <Footer />
            </main>
            <PostWhatsAppModal />
            <CartSync serverSeeded={initialServerCart != null} />
          </CartSeedProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
