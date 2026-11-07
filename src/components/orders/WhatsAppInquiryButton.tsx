"use client";

import { useState } from "react";
import { IoLogoWhatsapp } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { titleFont } from "@/config/fonts";
import { buildInquiryMessage, buildWaMeUrl } from "@/lib/whatsapp";

type Props = {
  className?: string;
  label?: string;
  title?: string;
  description?: string;
};

/** Outside-catalog inquiry: opens WA without createOrder / post-WA modal. */
export function WhatsAppInquiryButton({
  className,
  label = "Enviar a WhatsApp",
  title = "Lo armamos personalizado pensando en vos",
  description = "¿Buscás algo que no está en el catálogo? Contanos la idea y te respondemos por WhatsApp.",
}: Props) {
  const [text, setText] = useState("");

  function handleClick() {
    const url = buildWaMeUrl(buildInquiryMessage(text));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={`inquiry-band relative overflow-hidden rounded-2xl px-5 py-10 sm:px-8 sm:py-12 ${className ?? ""}`}
    >
      <div className="inquiry-band__glow" aria-hidden />
      <div className="relative mx-auto max-w-xl text-center">
        <p className="mb-3 text-xs font-medium tracking-[0.14em] text-(--secondary) uppercase">
          Pedidos a medida
        </p>
        <h2
          className={`${titleFont.className} text-3xl leading-tight text-stone-900 sm:text-4xl`}
        >
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-stone-600">
          {description}
        </p>

        <div className="mt-7 space-y-3 text-left">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Ej: mesa dulce temática unicornio para 40 personas, con tartas y alfajores…"
            className="min-h-24 resize-none border-stone-200/80 bg-white/90 shadow-sm backdrop-blur-sm"
          />
          <div className="flex justify-end">
            <Button type="button" size="lg" onClick={handleClick}>
              <IoLogoWhatsapp className="size-5" aria-hidden />
              {label}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
