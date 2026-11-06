import Image from "next/image";
import Link from "next/link";
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoWhatsapp,
  IoLocationOutline,
} from "react-icons/io5";

import { ScrollToSectionLink } from "@/components/ui/ScrollToSectionLink";
import { titleFont } from "@/config/fonts";
import {
  SITE_FOOTER_BLURB,
  SITE_NAME,
  SITE_SERVICE_AREA,
  SITE_TAGLINE,
  SOCIAL_LINKS,
} from "@/lib/site";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";

const socialIconClass =
  "inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-stone-200 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white";

export function Footer() {
  const whatsappUrl = getWhatsAppChatUrl();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full bg-[#2a2118] text-stone-300">
      <div className="page-gutter grid gap-10 py-12 md:grid-cols-3 md:gap-8 lg:gap-12">
        <div className="flex flex-col items-start gap-5">
          <Link href="/" className="group inline-flex flex-col gap-2">
            <Image
              src="/branding/icon-cuted-coco-footer.png?v=9"
              alt={SITE_NAME}
              width={80}
              height={102}
              className="h-12 object-contain"
              unoptimized
            />
            <span
              className={`${titleFont.className} text-lg font-bold text-white antialiased`}
            >
              {SITE_NAME}
            </span>
            <span className="text-[11px] tracking-[0.18em] text-stone-400 uppercase">
              {SITE_TAGLINE}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={socialIconClass}
              aria-label={`${SITE_NAME} en Instagram`}
            >
              <IoLogoInstagram className="size-5" aria-hidden />
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={socialIconClass}
              aria-label={`${SITE_NAME} en Facebook`}
            >
              <IoLogoFacebook className="size-5" aria-hidden />
            </a>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={socialIconClass}
                aria-label={`Escribir por WhatsApp a ${SITE_NAME}`}
              >
                <IoLogoWhatsapp className="size-5" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex items-center md:justify-center">
          <p className="max-w-sm text-sm leading-relaxed text-stone-300 md:text-center">
            {SITE_FOOTER_BLURB}
          </p>
        </div>

        <div className="flex flex-col gap-6 md:items-end md:text-right">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white uppercase">
              Empresa
            </p>
            <nav
              aria-label="Enlaces del sitio"
              className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-stone-400 md:justify-end"
            >
              <ScrollToSectionLink
                sectionId="consulta"
                className="hover:text-white"
              >
                Cotización
              </ScrollToSectionLink>
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white uppercase">
              Contacto
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {whatsappUrl ? (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-stone-300 hover:text-white md:flex-row-reverse"
                  >
                    <IoLogoWhatsapp
                      className="size-4 shrink-0 text-(--accent-orange)"
                      aria-hidden
                    />
                    WhatsApp
                  </a>
                </li>
              ) : null}
              <li className="inline-flex items-center gap-2 text-stone-300 md:flex-row-reverse">
                <IoLocationOutline
                  className="size-4 shrink-0 text-(--accent-orange)"
                  aria-hidden
                />
                <span>{SITE_SERVICE_AREA}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-gutter flex flex-col gap-2 py-4 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-stone-400">
            © {year} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <p className="text-stone-400 sm:text-right">
            Pedidos online · Confirmación por WhatsApp
          </p>
        </div>
      </div>
    </footer>
  );
}
