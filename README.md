# Origen Café

Tienda online de café de especialidad: 6 cafés en bolsa (250 g, 500 g y 1 kg, con la molienda a elección) y 4 accesorios. Trabajo integrador de Programación Web (ITBA, 2026 Q1).

> Es una tienda de demostración: las reseñas, estadísticas y pagos son de ejemplo.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4**, en JavaScript.
- **Supabase**: base de datos Postgres con SQL directo (migraciones y seed versionados), Auth y RLS.
- **Vercel** para el despliegue (con preview por PR) y **GitHub Actions** para CI (lint + build).
- Próximamente: **Mercado Pago** (Checkout Pro + webhook) y **Playwright** (tests E2E).

## Cómo correrlo

Requisitos: Node 20 o más nuevo y un proyecto de Supabase.

```bash
npm install
cp .env.example .env.local   # y completar los valores (ver abajo)
npm run dev                  # http://localhost:3000
```

Otros scripts: `npm run lint`, `npm run build` y `npm start`.

### Variables de entorno

| Variable | Dónde se consigue | ¿Es secreta? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API (URL base, sin `/rest/v1`) | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key | No: es pública, la protección la da RLS |

Las dos tienen que estar en tres lugares: `.env.local` (para desarrollo), en Vercel (Settings → Environment Variables, en Production, Preview y Development) y en GitHub (Settings → Secrets and variables → Actions → **Variables**), porque el build de CI lee el catálogo de la base.

La clave secreta (`service_role`) nunca se commitea ni se usa en el navegador.

### Base de datos

En el **SQL Editor** de Supabase, ejecutar en orden el contenido de:

1. `supabase/migrations/001_esquema.sql`: tablas, `CHECK`s, índices y el trigger que crea el perfil de cada usuario nuevo.
2. `supabase/migrations/002_seguridad.sql`: función `es_admin()` y políticas RLS.
3. `supabase/seed.sql`: los 6 cafés con sus 18 variantes, los 4 accesorios y las reseñas de ejemplo.
4. `supabase/migrations/003_imagenes.sql`: bucket `productos` de Supabase Storage para las fotos (lectura pública, solo el admin sube o borra).

## Modelo de datos

| Tabla | Para qué |
|---|---|
| `productos` | Cafés y accesorios (`categoria`). Los campos de café (origen, perfil, tostado, acidez, cuerpo, notas) quedan `null` en los accesorios. |
| `variantes` | Cada peso de bolsa (o la única variante de un accesorio), con precio y stock propios. |
| `resenas` | Reseñas de cada producto. |
| `profiles` | Un perfil por usuario de Supabase Auth, con su `role` (`cliente` o `admin`). |
| `ordenes` / `orden_items` | Pedidos y sus líneas (con la molienda elegida). Se usan desde el checkout. |

**Seguridad (RLS):** cualquiera puede ver los productos activos, sus variantes y reseñas; solo un admin los modifica. Cada usuario ve únicamente su perfil y sus órdenes. Un usuario puede cambiar su nombre, pero no su `role`.

## Cuentas de usuario

Registro e ingreso con email y contraseña (Supabase Auth). El navegador nunca habla directo con Supabase Auth: los formularios validan y envían con `fetch` a la API propia, que vuelve a validar.

| Ruta | Qué hace |
|---|---|
| `POST /api/auth/registro` | Crea la cuenta (nombre, email, contraseña) y deja la sesión iniciada. |
| `POST /api/auth/ingresar` | Inicia sesión. |
| `POST /api/auth/salir` | Cierra la sesión. |
| `GET /api/auth/sesion` | Devuelve el usuario conectado (`email`, `nombre`, `role`) o `null`. |

Los errores vuelven como `{ errores: { campo: mensaje } }` (validación, 400) o `{ error: mensaje }` (credenciales u otros, 401/4xx).

- La sesión vive en **cookies**. `proxy.js` la renueva antes de las páginas que la leen en el servidor (`/cuenta`, `/admin`, `/ingresar`, `/registro`).
- `/cuenta` muestra los pedidos del usuario. Sin sesión, redirige a `/ingresar?siguiente=/cuenta`.
- El header pregunta por la sesión a `/api/auth/sesion`, así el resto de la tienda sigue siendo estática.

## Panel admin

En `/admin` (link "Panel admin" en el menú de la cuenta) un usuario con `role = 'admin'` maneja la tienda sin tocar código:

- **Resumen:** productos visibles, variantes sin stock, pedidos y la lista de variantes para reponer.
- **Productos:** todos los productos (también los ocultos), con el stock de cada variante editable en el lugar y un interruptor para mostrarlos u ocultarlos.
- **Cargar y editar:** formulario de café o accesorio con sus variantes (peso o nombre, precio y stock) y la foto, que se sube a Supabase Storage.
- **Borrar:** borra el producto con sus variantes y reseñas. Si ya tiene pedidos la base no lo permite, y conviene ocultarlo.

Cada cambio regenera las páginas de la tienda al instante (`revalidatePath`).

| Ruta | Qué hace |
|---|---|
| `POST /api/productos` | Crea un producto con sus variantes. |
| `PUT /api/productos/:id` | Reemplaza los datos y sincroniza las variantes (actualiza, crea y borra). |
| `PATCH /api/productos/:id` | Muestra u oculta el producto (`{ activo }`). |
| `DELETE /api/productos/:id` | Borra el producto (409 si tiene pedidos). |
| `PATCH /api/variantes/:id` | Cambia el stock (`{ stock }`). |
| `POST /api/imagenes` | Sube una foto (FormData, JPG/PNG/WebP de hasta 4 MB) y devuelve su URL. |

**Seguridad en tres capas:** la página o la API chequea el rol (sin sesión: 401 o redirección a ingresar; sin ser admin: 403 o 404), la validación se repite en el servidor (`lib/validacion-producto.js`, la misma del formulario) y RLS en la base rechaza cualquier cambio que no venga de un admin.

**El primer admin** se crea a mano. Primero se registra la cuenta en `/registro` y después, en el SQL Editor de Supabase:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'tu@email.com');
```

## Estructura

```
app/                 páginas (App Router) y componentes
  admin/             panel admin (resumen, lista de productos, formulario)
  api/auth/          Route Handlers de la cuenta
  api/productos/, api/variantes/, api/imagenes/   Route Handlers del panel admin
  components/        componentes compartidos (header, tarjetas, carrito, sesión, test…)
proxy.js             renueva la sesión antes de las páginas que la usan
lib/
  auth.js            validación de los formularios de cuenta (navegador y servidor)
  admin.js           chequeo de rol admin, errores de la base y regeneración de la tienda
  validacion-producto.js   validación del formulario de productos (navegador y servidor)
  supabase/          cliente de Supabase con la sesión del usuario (cookies)
  datos.js           lecturas del catálogo desde Supabase
  productos.js       perfiles, tostados, moliendas y helpers de producto
  tienda.js          promociones (bundles, transferencia, cuotas, envío gratis)
  carrito.js         cálculo puro del carrito (se reutilizará en el servidor al crear la orden)
  recomendacion.js   lógica del test "Elegí tu café ideal"
supabase/
  migrations/        esquema y seguridad en SQL
  seed.sql           datos iniciales
```

## Decisiones

- **El catálogo se lee en el servidor** y las páginas se regeneran cada 5 minutos (`revalidate = 300`), así un cambio en la base aparece sin volver a desplegar.
- **El carrito vive en el navegador** (`localStorage`) y guarda solo variante, molienda y cantidad, nunca precios: los totales se recalculan siempre con los precios de la base.
- **La molienda no es una variante:** se elige al comprar y no cambia el precio ni el stock.
- **Las reglas de negocio están en la base:** valores cerrados y rangos con `CHECK`, permisos con RLS.
- **Una sola validación para el navegador y el servidor** (`lib/auth.js`): el navegador avisa antes de enviar, y el servidor no confía en lo que llega.

El historial de decisiones y prompts está en [`PROMPTS.md`](PROMPTS.md), y el contexto completo del proyecto en [`CLAUDE.md`](CLAUDE.md).
