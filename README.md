# Manjares de Oro Verde

Sitio de mesas dulces: catálogo, carrito (LocalStorage + sync con cuenta), pedido por WhatsApp con **código de seguimiento**, vista pública `/pedido/[codigo]` y admin de seña/envío/estados.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL
- Auth.js (Google) + whitelist `ADMIN_EMAILS`
- Zustand (carrito)

## Setup local

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Variables clave: `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_*`, `ADMIN_EMAILS`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_APP_URL`.

## Flujo de órdenes

1. El cliente arma el carrito y toca **Pedir por WhatsApp**.
2. Se crea una orden `PENDIENTE_CONFIRMACION` con código `MOV-XXXXXX`.
3. Se abre `wa.me` con el código y el link `/pedido/MOV-XXXXXX`.
4. Al volver, un modal pregunta si realizó el pedido (solo este CTA; la consulta fuera de catálogo no lo dispara).
5. El admin edita seña, envío, total y estado en `/admin/pedidos`.

## Rutas

| Ruta | Descripción |
|---|---|
| `/carrito` | Carrito + form evento + WA |
| `/pedido/[code]` | Seguimiento público (datos enmascarados) |
| `/mis-pedidos` | Historial (login) |
| `/admin/pedidos` | Gestión admin |
