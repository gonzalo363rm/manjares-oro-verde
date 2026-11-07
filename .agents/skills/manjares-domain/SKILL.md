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

1. Al tocar **Pedir por WhatsApp** → `createOrder` crea orden `PENDIENTE_CONFIRMACION` con código `MOV-XXXXXX` (con `userId` si hay sesión; guests OK).
2. Contacto/teléfono opcionales (carrito y “Mis datos”).
3. El mensaje WA incluye código + link `/pedido/[code]`.
4. Reutilizar código si el `cartHash` no cambió (mismo dueño, pendiente).
5. Consulta fuera de catálogo → `buildInquiryMessage` **sin** orden.
6. Vista pública `/pedido/[code]`: sin login; enmascarar teléfono/nombre/dirección; muestra descuento si hay; `noindex`.
7. Admin `/admin/pedidos`: estado libre, seña, envío+dirección, descuento, total override, ítems (catálogo o libres), `OrderChangeLog`; `remaining = total - deposit` (no persistir). `confirmedAt` al salir de pendiente (ventas).
8. Aviso admin: badge pendientes + email SMTP en `after()` al crear pedido nuevo.

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
