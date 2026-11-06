import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IoArrowForward } from "react-icons/io5";

import { CategoryCard } from "@/components/catalog/CategoryCard";
import { PickupPointsSection } from "@/components/home/PickupPointsSection";
import { WhatsAppInquiryButton } from "@/components/orders/WhatsAppInquiryButton";
import { HomeScrollToSection } from "@/components/ui/HomeScrollToSection";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollToSectionLink } from "@/components/ui/ScrollToSectionLink";
import { TextLink } from "@/components/ui/TextLink";
import { titleFont } from "@/config/fonts";
import { getActiveCategories } from "@/lib/catalog";
import { getActivePickupPoints } from "@/lib/pickup-points";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, pickupPoints] = await Promise.all([
    getActiveCategories(),
    getActivePickupPoints(),
  ]);

  return (
    <div className="pb-16">
      <Suspense fallback={null}>
        <HomeScrollToSection />
      </Suspense>
      <div className="home-viewport">
        <section className="hero-band fade-in-up">
          <div className="hero-band__image" aria-hidden />
          <div className="hero-band__wash" aria-hidden />
          <div className="hero-band__top-fade" aria-hidden />
          <div className="hero-band__content page-gutter relative flex flex-1 flex-col">
            <div className="max-w-xl lg:max-w-2xl">
              <h1
                className={`${titleFont.className} text-4xl font-bold antialiased sm:text-5xl color-secondary`}
              >
                Manjares de Oro Verde
              </h1>
              <p className="text-lead mt-4">
                Mesas dulces personalizadas para eventos, cumpleaños y
                casamientos.
                <br />
                Armá tu pedido y escribinos por WhatsApp: nosotros nos ocupamos
                del resto.
              </p>
              <div className="fade-in-up anim-delay-2 mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
                <ScrollToSectionLink
                  sectionId="consulta"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-(--secondary) px-7 text-[15px] font-medium text-white shadow-sm transition-all hover:brightness-95 hover:shadow-md"
                >
                  Pedir una cotización para mi evento
                  <IoArrowForward
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </ScrollToSectionLink>
                <Link
                  href="/catalogo"
                  className="hero-band__muted-link group inline-flex items-center gap-2 text-[15px] font-medium text-(--v4-text-muted) transition-colors hover:text-stone-800"
                >
                  Ver el catálogo de productos
                  <IoArrowForward
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Reveal className="page-gutter py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className={`${titleFont.className} text-2xl font-semibold`}>
              Nuestras categorías
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Entrá a cada una para ver productos y armar tu pedido
            </p>
          </div>
          <TextLink href="/catalogo">Ver todo</TextLink>
        </div>
        {categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
            Pronto vas a ver acá las categorías del catálogo.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const fallback = c.products[0]?.images[0];
              return (
                <CategoryCard
                  key={c.id}
                  name={c.name}
                  slug={c.slug}
                  description={c.description}
                  imagePublicId={c.imagePublicId}
                  imageVersion={c.imageVersion}
                  hoverImagePublicId={c.hoverImagePublicId}
                  hoverImageVersion={c.hoverImageVersion}
                  fallbackPublicId={fallback?.publicId}
                  fallbackVersion={fallback?.version}
                />
              );
            })}
          </div>
        )}
      </Reveal>

      <section className="page-gutter py-8 sm:py-10">
        <Reveal className="mb-5 text-center">
          <h2 className={`${titleFont.className} text-2xl font-semibold`}>
            Tres pasos, cero vueltas
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-stone-600">
            Del catálogo al WhatsApp, sin vueltas.
          </p>
        </Reveal>

        <ol className="m-0 list-none space-y-4 p-0 sm:space-y-5">
          {[
            {
              step: "01",
              title: "Elegí productos",
              text: "Sumá al carrito lo que querés para tu mesa dulce.",
              from: "left" as const,
            },
            {
              step: "02",
              title: "Pedí por WhatsApp",
              text: "Iniciá sesión, generamos un código y abrimos el chat.",
              from: "right" as const,
            },
            {
              step: "03",
              title: "Seguí tu orden",
              text: "Mirás estado, seña y restante con tu código de pedido.",
              from: "left" as const,
            },
          ].map((item, i) => (
            <li key={item.step}>
              <Reveal
                from={item.from}
                delayMs={i * 70}
                className="home-steps__item"
              >
                <span className="home-steps__num" aria-hidden>
                  {item.step}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-snug text-stone-600">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <Reveal className="page-gutter py-10 sm:py-14">
        <div id="consulta">
          <WhatsAppInquiryButton />
        </div>
      </Reveal>

      <Reveal>
        <PickupPointsSection points={pickupPoints} />
      </Reveal>
    </div>
  );
}
