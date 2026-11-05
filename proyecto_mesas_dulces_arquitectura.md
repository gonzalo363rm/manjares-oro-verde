# Proyecto: Sitio web para mesas dulces personalizadas

## 1. Objetivo del proyecto

Crear una aplicación web sencilla para el emprendimiento de mesas dulces personalizadas para eventos.

La idea inicial es que el sitio permita:

- Mostrar los productos disponibles.
- Mostrar ejemplos/fotos de mesas dulces y productos.
- Permitir que un potencial cliente arme una consulta seleccionando productos.
- Recibir los datos del evento y enviar una solicitud de presupuesto.
- Tener un pequeño panel de administración para gestionar productos y precios.
- Eventualmente integrar Instagram para obtener fotos asociadas a un hashtag específico.

El objetivo es mantener el proyecto simple y evitar construir funcionalidades innecesarias para un emprendimiento pequeño.

---

## 2. Funcionalidad pública propuesta

### Landing / página principal

La página pública podría incluir:

- Presentación del emprendimiento.
- Tipos de eventos atendidos, por ejemplo:
  - Cumpleaños.
  - Casamientos.
  - Bautismos.
  - Eventos empresariales.
- Catálogo de productos.
- Galería de fotos.
- CTA para armar una consulta/pedir presupuesto.

### Catálogo

Los productos podrían tener:

- Nombre.
- Descripción.
- Categoría.
- Precio o precio de referencia.
- Imagen/es.
- Estado activo/inactivo.
- Opcionalmente, información como cantidad mínima o unidad de venta.

Ejemplos:

- Tortas.
- Cupcakes.
- Alfajores.
- Brownies.
- Cookies.
- Candy personalizado.
- Otros productos de mesa dulce.

### Formulario de consulta

El usuario podría seleccionar productos y completar información del evento.

Ejemplo conceptual:

- Cantidad de invitados.
- Fecha del evento.
- Tipo de evento.
- Productos seleccionados.
- Cantidades.
- Comentarios/adicionales.
- Datos de contacto.

La finalidad principal no sería necesariamente realizar una compra online, sino generar una consulta de presupuesto.

Flujo posible:

```text
Usuario
  ↓
Explora catálogo
  ↓
Selecciona productos
  ↓
Completa datos del evento
  ↓
"Consultar presupuesto"
  ↓
Se registra la consulta
  ↓
Se genera/enruta el contacto
  ↓
WhatsApp y/o email
```

---

## 3. Integración con Instagram

Se planteó utilizar fotos publicadas en Instagram asociadas a un hashtag específico para alimentar la galería del sitio.

Ejemplo:

```text
#mesadulceX
```

### Consideración importante

No conviene que la web dependa de consultar Instagram cada vez que un visitante entra.

La integración debería ser, idealmente, una sincronización:

```text
Instagram
   ↓
API / sincronización
   ↓
Administrador
   ↓
Fotos seleccionadas/importadas
   ↓
Base de datos / almacenamiento
   ↓
Web pública
```

Una posible interfaz de administración sería:

```text
Instagram
-------------------------
Hashtag: #mesadulceX

[ Sincronizar fotos ]

Fotos encontradas:

☑ foto 1
☑ foto 2
☐ foto 3
☑ foto 4

[ Importar seleccionadas ]
```

De esta forma, las imágenes utilizadas por la web quedan bajo control del sistema y un cambio de permisos/API de Instagram no rompe el sitio.

La integración con Instagram quedó planteada como una posible funcionalidad posterior, no como requisito imprescindible del MVP.

---

# 4. Panel de administración

El proyecto necesita un mini-admin, pero no un sistema administrativo grande.

Estructura conceptual:

```text
/admin

Dashboard
│
├── Productos
│   ├── Listar
│   ├── Crear
│   └── Editar
│
├── Categorías
│
├── Precios
│
├── Fotos
│
└── Consultas
```

Inicialmente, el administrador podría permitir:

- Crear productos.
- Editar productos.
- Activar/desactivar productos.
- Modificar precios.
- Administrar categorías.
- Administrar fotos.
- Consultar solicitudes de presupuesto.

No se considera necesario inicialmente:

- Roles complejos.
- Registro público de usuarios.
- Gestión de múltiples organizaciones.
- Sistema de permisos sofisticado.
- Facturación.
- Carrito de compra.
- Checkout/pagos online.
- Reservas complejas.

---

# 5. Autenticación del admin

Se discutieron tres alternativas.

## Opción A — OAuth externo

La opción considerada más conveniente es utilizar un proveedor externo, por ejemplo Google OAuth.

Flujo:

```text
/admin
   ↓
¿Hay sesión?
   ├── No → Login con Google
   │          ↓
   │       Google OAuth
   │          ↓
   └── Sí → ¿Email autorizado?
               ├── Sí → Admin
               └── No → Acceso denegado
```

Para una aplicación con uno o pocos administradores, se puede comenzar con una whitelist de emails autorizados.

Ejemplo conceptual:

```ts
const ADMIN_EMAILS = [
  "email-de-la-administradora@example.com",
  "otro-admin@example.com"
];
```

La autorización debe comprobarse del lado del servidor. No alcanza con ocultar `/admin` en el frontend.

Una alternativa futura sería guardar usuarios/admins en la base de datos:

```text
users
---------
id
email
name
image

admin_users
-----------
user_id
```

Pero para el MVP probablemente una whitelist sea suficiente.

## Opción B — Magic link

Otra alternativa:

```text
/admin
   ↓
Ingresar email
   ↓
Enviar enlace
   ↓
Email
   ↓
Login
```

Ventaja: no hay contraseña.

Desventaja: requiere configurar un proveedor de email.

## Opción C — Usuario y contraseña propia

No se considera especialmente conveniente para este proyecto porque obligaría a implementar y mantener:

- Hashing.
- Sesiones.
- Cookies.
- Recuperación de contraseña.
- Cambio de contraseña.
- Seguridad del login.

Para un único administrador sería infraestructura innecesaria.

### Decisión preliminar

Para el MVP:

**OAuth externo + whitelist de emails**.

La implementación concreta del proveedor de autenticación debe revisarse al momento de desarrollar el proyecto y según el stack elegido.

---

# 6. Stack propuesto

Se planteó utilizar este proyecto como una oportunidad para probar Svelte 5/SvelteKit.

Stack inicial propuesto:

```text
Frontend / framework:
Svelte 5
SvelteKit

Lenguaje:
TypeScript

Estilos:
Tailwind CSS

Validación:
Zod

ORM:
Drizzle ORM

Base de datos:
PostgreSQL

Hosting:
Vercel

Autenticación:
OAuth externo (posiblemente Google)

Email / contacto:
A definir

Instagram:
Integración posterior, si resulta necesaria
```

La propuesta es deliberadamente pequeña: evitar agregar librerías que no aporten valor real al proyecto.

---

# 7. Por qué SvelteKit puede encajar en este proyecto

Se consideró que este proyecto es un buen candidato para probar Svelte 5 + SvelteKit porque tiene una arquitectura relativamente sencilla:

- Sitio público.
- Catálogo.
- Formularios.
- CRUD administrativo.
- SSR/SEO.
- Server-side actions.
- Poca necesidad de estado global complejo.

No parece necesario incorporar inicialmente:

- Zustand.
- TanStack Query.
- Una arquitectura SPA compleja.
- Un sistema de estado global grande.

## Estado

Svelte 5 permite manejar estado local con runes como:

```ts
let selectedProducts = $state([]);
```

y estado derivado:

```ts
let total = $derived(...);
```

La intención es aprovechar la reactividad de Svelte sin agregar un gestor global de estado salvo que aparezca una necesidad concreta.

---

# 8. Arquitectura posible de SvelteKit

Una estructura inicial podría ser:

```text
src/
├── routes/
│   ├── +page.svelte
│   │
│   ├── productos/
│   │   └── +page.svelte
│   │
│   ├── consulta/
│   │   ├── +page.svelte
│   │   └── +page.server.ts
│   │
│   ├── admin/
│   │   ├── +layout.server.ts
│   │   ├── +page.svelte
│   │   │
│   │   ├── productos/
│   │   │   ├── +page.svelte
│   │   │   ├── nuevo/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.server.ts
│   │   │   └── [id]/
│   │   │       ├── +page.svelte
│   │   │       └── +page.server.ts
│   │   │
│   │   ├── fotos/
│   │   └── consultas/
│   │
│   └── api/
│       └── ... (solo si realmente son necesarios endpoints)
│
├── lib/
│   ├── components/
│   ├── server/
│   │   ├── db/
│   │   ├── auth/
│   │   └── services/
│   ├── schemas/
│   └── utils/
│
└── app.html
```

Esta estructura es orientativa y puede simplificarse.

---

# 9. Carga de datos y mutaciones

Una de las razones para considerar SvelteKit es que el framework permite resolver gran parte de la comunicación servidor/interfaz mediante sus mecanismos nativos.

Conceptualmente:

```text
Página
  ↓
load()
  ↓
datos
  ↓
componente Svelte
```

Para formularios:

```text
<form>
  ↓
SvelteKit form action
  ↓
validación
  ↓
service
  ↓
DB
```

Esto puede evitar crear APIs REST internas innecesarias.

Ejemplo conceptual:

```text
/admin/productos
        ↓
load()
        ↓
ProductService
        ↓
PostgreSQL
```

Y para crear:

```text
Formulario
    ↓
POST / action
    ↓
Zod
    ↓
ProductService
    ↓
Drizzle
    ↓
PostgreSQL
```

---

# 10. Servicios y acceso a datos

Se recomienda separar el acceso a la base de datos de las páginas.

Por ejemplo:

```text
lib/
└── server/
    ├── db/
    │   ├── client.ts
    │   └── schema.ts
    │
    └── services/
        ├── products.service.ts
        ├── categories.service.ts
        ├── inquiries.service.ts
        └── photos.service.ts
```

Las rutas deberían encargarse principalmente de:

- Recibir parámetros/formularios.
- Validar autorización.
- Validar input.
- Llamar al servicio.
- Devolver/renderizar el resultado.

Los servicios se ocuparían de la lógica de negocio y acceso a datos.

---

# 11. Base de datos inicial

Un modelo posible, todavía sujeto a revisión:

```text
products
---------
id
name
description
price
category_id
image_url
active
created_at
updated_at

categories
----------
id
name
slug
created_at
updated_at

inquiries
---------
id
event_type
event_date
guest_count
name
email
phone
comments
created_at
updated_at

inquiry_items
-------------
id
inquiry_id
product_id
quantity
price_at_time (opcional)
```

La columna `price_at_time` puede ser útil si se quiere conservar el precio que tenía el producto cuando se realizó la consulta, aunque el precio actual cambie posteriormente.

Para fotos se podría tener:

```text
photos
------
id
url
source
instagram_id (opcional)
caption (opcional)
active
created_at
```

El modelo definitivo dependerá de cómo se decida manejar imágenes y si se implementa la integración con Instagram.

---

# 12. Consultas y WhatsApp

El objetivo inicial no necesariamente es tener un sistema de ventas completo.

Una posibilidad es:

```text
Cliente arma consulta
       ↓
Servidor registra consulta
       ↓
Se genera mensaje
       ↓
WhatsApp
```

El mensaje podría contener:

```text
Hola, quisiera consultar por una mesa dulce.

Fecha: ...
Evento: ...
Invitados: ...

Productos:
- 2 tortas
- 30 cupcakes
- 40 alfajores

Comentarios:
...
```

También podría enviarse una notificación por email.

La decisión entre WhatsApp, email, ambos o solamente almacenamiento en el admin queda abierta.

---

# 13. SEO y Vercel

Se planteó utilizar Vercel para desplegar la aplicación.

Una URL gratuita de Vercel como:

```text
https://mesasdulces.vercel.app
```

no recibe una penalización SEO simplemente por ser un dominio/subdominio de Vercel.

Sin embargo, para un negocio real se considera preferible utilizar un dominio propio:

```text
https://mesasdulces.com.ar
```

principalmente por:

- Marca.
- Confianza.
- Recordación.
- Presentación profesional.

La arquitectura sería:

```text
Dominio propio
      ↓
Vercel
      ↓
SvelteKit
```

El dominio `vercel.app` puede utilizarse durante desarrollo/MVP y posteriormente redirigirse al dominio propio.

También conviene evitar que múltiples URLs de producción y previews sean indexadas como contenido duplicado.

---

# 14. Hosting y costes iniciales

Para un proyecto pequeño se planteó comenzar con:

```text
Vercel Hobby
+
PostgreSQL
+
Dominio propio (cuando corresponda)
```

No se considera necesario pagar un plan de Vercel desde el principio si el tráfico es bajo y el proyecto se mantiene dentro de los límites del plan gratuito.

El proveedor concreto de PostgreSQL todavía queda por decidir.

---

# 15. MVP recomendado

Para evitar sobreingeniería, el MVP podría limitarse a:

### Público

- Landing.
- Catálogo.
- Categorías.
- Fotos.
- Selección de productos.
- Formulario de consulta.
- Envío/registro de consulta.

### Admin

- Login externo.
- CRUD de productos.
- CRUD de categorías.
- Modificación de precios.
- Gestión básica de fotos.
- Visualización de consultas.

### Infraestructura

- Svelte 5.
- SvelteKit.
- TypeScript.
- Tailwind.
- Zod.
- Drizzle.
- PostgreSQL.
- Vercel.

### Dejar para después

- Sincronización automática con Instagram.
- Integración avanzada con WhatsApp.
- Email automático sofisticado.
- Múltiples administradores/roles.
- Usuarios de clientes.
- Pagos.
- Carrito.
- Reservas.
- Estadísticas avanzadas.
- CMS.
- Aplicación móvil.

---

# 16. Preguntas abiertas para revisar antes de implementar

1. ¿El precio se muestra públicamente o solamente se usa como referencia interna para calcular consultas?
2. ¿La consulta debe generar automáticamente un mensaje de WhatsApp?
3. ¿La consulta debe almacenarse en la base de datos?
4. ¿Se necesita enviar email además de WhatsApp?
5. ¿Los productos tienen precio unitario, por docena, por persona o múltiples variantes?
6. ¿Se necesita manejar productos personalizados?
7. ¿Las fotos se cargarán manualmente o se integrará Instagram desde el inicio?
8. ¿Dónde se almacenarán las imágenes?
9. ¿Se necesita que los precios históricos de una consulta queden congelados?
10. ¿Habrá uno o varios administradores?
11. ¿Se utilizará Google OAuth u otro proveedor?
12. ¿Se utilizará dominio `.com.ar` desde el principio o primero `vercel.app`?
13. ¿Qué proveedor de PostgreSQL se utilizará?
14. ¿Se necesita un sistema de contacto distinto de WhatsApp?
15. ¿Qué información mínima debe solicitar el formulario para poder preparar un presupuesto?

---

# 17. Principio arquitectónico general

La aplicación debería mantenerse deliberadamente simple:

```text
                ┌────────────────────┐
                │    SvelteKit       │
                └─────────┬──────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
        Sitio público               /admin
             │                         │
        catálogo                  OAuth
        fotos                     autorización
        formulario                     │
             │                    CRUD / gestión
             │                         │
             └────────────┬────────────┘
                          │
                    Server Services
                          │
                       Drizzle
                          │
                     PostgreSQL
```

La regla principal sería **usar las capacidades nativas de SvelteKit siempre que sean suficientes y agregar librerías externas solamente cuando resuelvan una necesidad concreta**.

Esto permite que el proyecto sea pequeño, fácil de mantener y, al mismo tiempo, suficientemente real como para servir como proyecto práctico para evaluar Svelte 5/SvelteKit frente al stack habitual de React/Next.
