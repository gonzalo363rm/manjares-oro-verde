import type { Metadata } from "next";

import { getCart } from "@/actions/cart";
import { auth } from "@/auth";
import { CartSeedProvider } from "@/components/cart/cart-seed-context";
import { CartSync } from "@/components/cart/CartSync";
import { PostWhatsAppModal } from "@/components/orders/PostWhatsAppModal";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Footer } from "@/components/ui/Footer";
import { TopMenu } from "@/components/ui/TopMenu";
import { dmSans, inter } from "@/config/fonts";

import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Manjares de Oro Verde",
    absolute: "Manjares de Oro Verde — Mesas dulces",
  },
  description:
    "Mesas dulces personalizadas para tu evento. Pedí por WhatsApp y seguí tu orden.",
  applicationName: "Manjares de Oro Verde",
  keywords: [
    "mesas dulces",
    "Manjares de Oro Verde",
    "alfajores",
    "eventos",
    "cumpleaños",
    "casamientos",
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
    siteName: "Manjares de Oro Verde",
    title: "Manjares de Oro Verde — Mesas dulces",
    description:
      "Mesas dulces personalizadas para tu evento. Pedí por WhatsApp y seguí tu orden.",
    images: [
      {
        url: "/branding/logo.jpg",
        width: 1200,
        height: 1200,
        alt: "Manjares de Oro Verde",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manjares de Oro Verde — Mesas dulces",
    description:
      "Mesas dulces personalizadas para tu evento. Pedí por WhatsApp y seguí tu orden.",
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
    <html lang="es">
      <body
        className={`${inter.className} ${dmSans.variable} antialiased`}
        suppressHydrationWarning
      >
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
