"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  IoCart,
  IoCartOutline,
  IoClipboardOutline,
  IoCloseOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoPersonCircleOutline,
  IoSettingsOutline,
} from "react-icons/io5";

import { countPendingOrders } from "@/actions/orders";
import { ScrollToSectionLink } from "@/components/ui/ScrollToSectionLink";
import { Skeleton } from "@/components/ui/skeleton";
import { titleFont } from "@/config/fonts";
import { useCartStore } from "@/store/cart/cart-store";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/mis-pedidos", label: "Mis pedidos" },
  { href: "/#consulta", label: "Consultas", sectionId: "consulta" },
] as const;

const ADMIN_LINKS = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/pedidos", label: "Gestionar pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/ventas", label: "Ventas" },
] as const;

const SCROLL_RANGE_PX = 120;

function CartIcon({
  sizeClass,
  totalItems,
  loaded,
}: {
  sizeClass: string;
  totalItems: number;
  loaded: boolean;
}) {
  return (
    <span className={`relative inline-flex ${sizeClass}`}>
      <IoCartOutline className={`site-nav-cart__outline ${sizeClass}`} />
      <IoCart className={`site-nav-cart__filled ${sizeClass}`} />
      {loaded && totalItems > 0 ? (
        <span className="site-nav-cart-badge badge-pop absolute -top-2 -right-2 rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      ) : null}
    </span>
  );
}

function UserAvatar({
  image,
  size = 28,
}: {
  image?: string | null;
  size?: number;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <IoPersonCircleOutline
      className="text-stone-700"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

function UserMenu({
  image,
  displayName,
  size = 28,
  isAdmin = false,
  pendingCount = 0,
}: {
  image?: string | null;
  displayName: string;
  size?: number;
  isAdmin?: boolean;
  pendingCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="site-nav-avatar"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          isAdmin && pendingCount > 0
            ? `Menú de cuenta, ${pendingCount} pedidos pendientes`
            : "Menú de cuenta"
        }
        onClick={() => setOpen((v) => !v)}
      >
        <span className="site-nav-avatar__inner">
          <UserAvatar image={image} size={size} />
          <svg
            className="site-nav-avatar__ring"
            viewBox="0 0 36 36"
            aria-hidden
          >
            <circle cx="18" cy="18" r="16" pathLength="100" />
          </svg>
          {isAdmin && pendingCount > 0 ? (
            <span className="site-nav-cart-badge badge-pop absolute -top-2 -right-2 rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 min-w-52 rounded-md border border-stone-200 bg-white py-2 shadow-lg"
        >
          <p className="px-3 py-2 text-center text-sm font-semibold text-stone-800">
            ¡Hola, {displayName}!
          </p>
          <div className="my-1 border-t border-stone-100" />
          {isAdmin
            ? ADMIN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
                  onClick={() => setOpen(false)}
                >
                  {link.href === "/admin" ? (
                    <IoSettingsOutline className="h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <IoClipboardOutline className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <span className="flex-1">{link.label}</span>
                  {link.href === "/admin/pedidos" && pendingCount > 0 ? (
                    <span className="rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  ) : null}
                </Link>
              ))
            : null}
          {isAdmin ? (
            <div className="my-1 border-t border-stone-100" />
          ) : null}
          <Link
            href="/mis-datos"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
            onClick={() => setOpen(false)}
          >
            <IoPersonCircleOutline className="h-4 w-4 shrink-0" aria-hidden />
            Mis datos de contacto
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50"
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
          >
            <IoLogOutOutline className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function TopMenu() {
  const { data: session, status } = useSession();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const cartHydrated = useCartStore((s) => s.hydrated);
  const cartSyncing = useCartStore((s) => s.syncing);
  const cartMode = useCartStore((s) => s.mode);
  const [loaded, setLoaded] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [chromeShift, setChromeShift] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const isAdmin = Boolean(session?.user?.isAdmin);
  const displayName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Cuenta";
  const cartBadgeReady =
    loaded &&
    cartHydrated &&
    !cartSyncing &&
    !(status === "authenticated" && cartMode !== "user") &&
    !(status === "loading");

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setPendingCount(0);
      return;
    }

    let cancelled = false;

    async function refreshPending() {
      try {
        const count = await countPendingOrders();
        if (!cancelled) setPendingCount(count);
      } catch {
        // ignore transient failures
      }
    }

    void refreshPending();
    const interval = window.setInterval(() => void refreshPending(), 60_000);

    function onVisible() {
      if (document.visibilityState === "visible") void refreshPending();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAdmin]);

  useEffect(() => {
    const update = () => {
      const barHeight = announcementRef.current?.offsetHeight ?? 0;
      const fullHeight = chromeRef.current?.offsetHeight ?? 0;
      const y = window.scrollY;
      // Primero se va la announcement bar (sin achicar el nav)
      const shift = Math.min(y, barHeight);
      const spacer = Math.max(0, fullHeight - shift);
      setChromeShift(shift);
      // Recién cuando la barra ya no se ve, arranca el efecto del header
      const effectiveScroll = Math.max(0, y - barHeight);
      setScrollProgress(Math.min(1, effectiveScroll / SCROLL_RANGE_PX));
      // Spacer visible + altura completa (padding del hero estable)
      if (fullHeight > 0) {
        document.documentElement.style.setProperty(
          "--site-chrome-spacer",
          `${spacer}px`,
        );
      }
      if (shift === 0 && fullHeight > 0) {
        document.documentElement.style.setProperty(
          "--site-chrome-full",
          `${fullHeight}px`,
        );
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--site-chrome-spacer");
      document.documentElement.style.removeProperty("--site-chrome-full");
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const cartLabel =
    cartBadgeReady && totalItems > 0
      ? `Carrito, ${totalItems} productos`
      : "Carrito";

  return (
    <>
      <div
        ref={chromeRef}
        className="site-chrome"
        style={{
          transform: `translateY(-${chromeShift}px)`,
          ["--scroll-progress" as string]: String(scrollProgress),
        }}
      >
        <div ref={announcementRef} className="announcement-bar">
          <p className="announcement-bar__text">
            <span className="announcement-bar__highlight">
              Envíos gratis en Oro Verde
            </span>{" "}
            para compras mayores a $20.000
            <span className="announcement-bar__sep" aria-hidden>
              ◆
            </span>
            Envíos a acordar para Paraná, Colonia Avellaneda, Colonia Ensayo y
            zonas aledañas
          </p>
        </div>

        <header className="site-topmenu">
          <nav className="site-topmenu__nav page-gutter flex w-full items-center justify-between gap-2 sm:gap-3">
            <Link
              href="/"
              aria-label="Manjares de Oro Verde"
              className={`${titleFont.className} site-topmenu__brand font-bold antialiased`}
              onClick={closeMenu}
            >
              <Image
                src="/branding/icon-cuted-coco.png"
                alt=""
                width={479}
                height={305}
                priority
                className="site-topmenu__brand-icon"
              />
              <span className="site-topmenu__brand-text">
                Manjares de Oro Verde
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) =>
                "sectionId" in link ? (
                  <ScrollToSectionLink
                    key={link.href}
                    sectionId={link.sectionId}
                    className="site-nav-link site-nav-link--desktop px-2 py-2"
                  >
                    {link.label}
                  </ScrollToSectionLink>
                ) : (
                  <Link
                    key={link.href}
                    className="site-nav-link site-nav-link--desktop px-2 py-2"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                href="/carrito"
                className="site-nav-link px-2 py-2"
                aria-label={cartLabel}
              >
                <CartIcon
                  sizeClass="site-nav-cart-icon"
                  totalItems={totalItems}
                  loaded={cartBadgeReady}
                />
              </Link>
              {status === "loading" ? (
                <span className="inline-flex items-center justify-center px-2 py-2">
                  <Skeleton
                    className="size-[30px] rounded-full"
                    aria-label="Cargando sesión"
                  />
                </span>
              ) : isAuthenticated ? (
                <UserMenu
                  image={session?.user?.image}
                  displayName={displayName}
                  size={30}
                  isAdmin={isAdmin}
                  pendingCount={pendingCount}
                />
              ) : (
                <Link
                  href="/auth/login"
                  className="site-nav-link site-nav-link--desktop px-2 py-2"
                >
                  Ingresar
                </Link>
              )}
            </div>

            <div className="site-topmenu__actions flex shrink-0 items-center gap-0.5 md:hidden">
              <Link
                href="/carrito"
                className="site-nav-link p-1.5"
                aria-label={cartLabel}
                onClick={closeMenu}
              >
                <CartIcon
                  sizeClass="h-6 w-6"
                  totalItems={totalItems}
                  loaded={cartBadgeReady}
                />
              </Link>
              {status === "loading" ? (
                <span className="inline-flex items-center justify-center p-1.5">
                  <Skeleton
                    className="size-7 rounded-full"
                    aria-label="Cargando sesión"
                  />
                </span>
              ) : isAuthenticated ? (
                <UserMenu
                  image={session?.user?.image}
                  displayName={displayName}
                  size={28}
                  isAdmin={isAdmin}
                  pendingCount={pendingCount}
                />
              ) : null}
              <button
                type="button"
                className="site-nav-link p-1.5"
                aria-expanded={menuOpen}
                aria-controls="site-mobile-menu"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? (
                  <IoCloseOutline className="h-7 w-7" />
                ) : (
                  <IoMenuOutline className="h-7 w-7" />
                )}
              </button>
            </div>
          </nav>

          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/25 md:hidden"
                aria-label="Cerrar menú"
                onClick={closeMenu}
              />
              <div
                id="site-mobile-menu"
                className="page-gutter absolute inset-x-0 top-full z-50 border-b border-stone-200/80 bg-[var(--header-soft)] py-4 shadow-md md:hidden"
              >
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) =>
                    "sectionId" in link ? (
                      <ScrollToSectionLink
                        key={link.href}
                        sectionId={link.sectionId}
                        className="site-nav-link px-3 py-3 text-base"
                        onClick={closeMenu}
                      >
                        {link.label}
                      </ScrollToSectionLink>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="site-nav-link px-3 py-3 text-base"
                        onClick={closeMenu}
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                  {!isAuthenticated ? (
                    <Link
                      href="/auth/login"
                      className="site-nav-link px-3 py-3 text-base"
                      onClick={closeMenu}
                    >
                      Ingresar
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </header>
      </div>

      {/* Reserva solo la parte visible del chrome (sin el hueco de la barra) */}
      <div className="site-chrome-spacer" aria-hidden />
    </>
  );
}
