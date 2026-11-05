import Link from "next/link";

import { ScrollToSectionLink } from "@/components/ui/ScrollToSectionLink";
import { titleFont } from "@/config/fonts";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border py-8">
      <div className="flex w-full flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
        <Link href="/" className="mx-3 hover:text-foreground">
          <span className={`${titleFont.className} font-bold antialiased`}>
            Manjares de Oro Verde
          </span>
          <span> © {new Date().getFullYear()}</span>
        </Link>
        <Link href="/mis-pedidos" className="mx-3 hover:text-foreground">
          Pedidos
        </Link>
        <Link href="/catalogo" className="mx-3 hover:text-foreground">
          Catálogo
        </Link>
        <ScrollToSectionLink
          sectionId="consulta"
          className="mx-3 hover:text-foreground"
        >
          Consultas
        </ScrollToSectionLink>
      </div>
    </footer>
  );
}
