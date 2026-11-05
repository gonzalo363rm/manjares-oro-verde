---
name: manjares-domain
description: Dominio y reglas de Manjares de Oro Verde (mesas dulces, carrito, órdenes con código WA, admin seña/envío). Usar al implementar o modificar checkout WhatsApp, pedidos, auth admin o catálogo.
---

# Manjares de Oro Verde — dominio del proyecto

## Stack

- Next.js 15 App Router + TypeScript + Tailwind
- Prisma 6 + PostgreSQL
- Auth.js (Google) + `ADMIN_EMAILS` whitelist
- Zustand cart (guest LS / user DB) + Zod
- Checkout: `wa.me` (sin pagos online)
- Cloudinary (imágenes) + nodemailer SMTP (avisos admin)

## Órdenes

1. **Login obligatorio** para pedir. Sin sesión: se guarda borrador `manjares-order-draft-v1` y redirect a `/auth/login?callbackUrl=/carrito?resume=1`. Al volver se restauran datos; el usuario debe tocar de nuevo el botón (no se abre WA solo).
2. Al tocar **Pedir por WhatsApp** con sesión → `createOrder` crea orden `PENDIENTE_CONFIRMACION` con `userId` y código `MOV-XXXXXX`.
3. El mensaje WA incluye código + link `/pedido/[code]`.
4. Reutilizar código si el `cartHash` no cambió (mismo usuario, pendiente).
5. Modal post-WA **solo** tras ese CTA (flag `manjares-awaiting-order-confirm`).
6. Consulta fuera de catálogo → `buildInquiryMessage` **sin** orden ni modal.
7. Sí en el modal → clear cart (también en DB si modo user) + mensaje historial/reseñas. No hay claim anónimo.
8. Vista pública `/pedido/[code]`: sin login; enmascarar teléfono/nombre/dirección; muestra descuento si hay; `noindex`.
9. Admin `/admin/pedidos`: estado libre, seña, envío+dirección, descuento, total override, ítems (catálogo o libres), `OrderChangeLog`; `remaining = total - deposit` (no persistir). `confirmedAt` al salir de pendiente (ventas).
10. Aviso admin: badge pendientes + email SMTP en `after()` al crear pedido nuevo.

## Carrito

- Invitado: `manjares-cart-v1` vía Zustand persist.
- Login: `CartSync` → `mergeGuestCart` → borra LS → modo `user`.
- Logout: store vacío en modo `guest`.
- Acciones: `getCart`, `mergeGuestCart`, `setCartItem`, `clearCart`.

## Catálogo

- Home: categorías activas → `/catalogo/[slug]`.
- `/catalogo` con tabs; cards con hover de 2ª imagen (Cloudinary).
- Admin: `/admin/productos`, `/admin/categorias`, `/admin/ventas`. Sync Meta = fase 2 (`CatalogSyncProvider` noop).

## Auth

- Admin solo server-side (`middleware` + `isAdminEmail` / `requireAdmin`).
- No-admin puede tener sesión; no entra a `/admin`.

## Fuera de alcance

- Instagram (nada).
- Sync catálogo Meta / chatbot WA = fase 2.
- No PayPal, no stock por talle, no upgrade Prisma 7 sin decisión explícita.

## Archivos clave

- `src/actions/orders/*`, `src/actions/cart/*`, `src/actions/products/*`, `src/actions/categories/*`
- `src/lib/order-*.ts`, `src/lib/whatsapp.ts`, `src/lib/catalog.ts`, `src/lib/sales-stats.ts`
- `src/components/orders/*`, `src/components/catalog/*`, `src/app/pedido/[code]`, `src/app/admin/*`
- `prisma/schema.prisma`, `ROADMAP.md`

## Convenciones

Naming de carpetas/código: rules en `.cursor/rules/` (`naming-and-structure`, `typescript-react`, `prisma-data`).
