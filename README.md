# Circe Witch

Web de Circe: catálogo de rituales con búsqueda inteligente, chatbot sin IA, solicitudes por WhatsApp y panel de administración.

- **Next.js 16** (App Router) + **Supabase** (base de datos, inicio de sesión de la admin e imágenes).
- Sin cuentas para clientes: el formulario arma el mensaje y lo abre en WhatsApp; se guarda una copia para el panel.
- Sin variables de Supabase la web funciona en **modo demo** con los datos de `src/data/`.

## Puesta en marcha

1. **Supabase** (proyecto nuevo):
   1. SQL Editor → pega y ejecuta `supabase/migrations/20261101000000_esquema_inicial.sql`.
   2. SQL Editor → pega y ejecuta `supabase/seed.sql` (secciones, 88 servicios, productos, preguntas del chatbot y textos).
   3. Authentication → Users → *Add user* con el correo y contraseña de la administradora.
   4. SQL Editor → `insert into public.admins (user_id) select id from auth.users where email = 'CORREO-DE-LA-ADMIN';`
2. **Local**: `cp .env.example .env.local`, completa las dos claves de Supabase y ejecuta `npm install` y `npm run dev`.
3. **Vercel**: importa el repositorio de GitHub y agrega las mismas variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` con la URL final).
4. En Supabase → Authentication → URL Configuration, pon la URL del sitio.

## Dónde se edita cada cosa (panel `/admin`)

| Sección | Qué hace |
|---|---|
| Resumen | Visitas, clics en «Solicitar» por lugar de la web, servicios más pedidos, solicitudes por día y clics por sección (7 o 30 días). |
| Solicitudes | Copias de los formularios enviados; se marcan como atendidas. |
| Catálogo | Servicios y productos: sección, nivel, precios USD/COP, «incluye», palabras clave, foto, visible y destacado. |
| Chatbot | Respuestas por servicio, sección o generales, y la bandeja de preguntas que el chat no supo responder. |
| Testimonios | Capturas de WhatsApp ancladas a un servicio (con confirmación de permiso). |
| Contenido | WhatsApp, redes, textos del inicio, biografía, fotos de Circe y el aviso de «Agenda llena». |

## Estructura

```
src/app/(sitio)/        páginas públicas: inicio, catálogo, servicio/[slug], testimonios
src/app/admin/          panel (login, resumen, solicitudes, catálogo, chatbot, testimonios, contenido)
src/app/api/            solicitud, evento (clics) y pregunta (sin respuesta): solo insertan
src/components/         hero, catálogo, chatbot, formulario de solicitud, navegación…
src/lib/                datos, búsqueda sin IA, motor del chat, precios, Supabase
src/data/               datos iniciales (también usados en modo demo)
supabase/               esquema con seguridad por filas y datos iniciales
```

`npm run seed:sql` regenera `supabase/seed.sql` a partir de `src/data/`.

## Más adelante: Cloudflare

El proyecto no usa nada exclusivo de Vercel. Para pasarlo a Cloudflare se puede usar el adaptador
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) o mantener Vercel y apuntar solo el dominio desde Cloudflare (DNS).
