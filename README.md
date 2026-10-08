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

## Modelo de datos

| Tabla | Para qué |
|---|---|
| `productos` | Cafés y accesorios (`categoria`). Los campos de café (origen, perfil, tostado, acidez, cuerpo, notas) quedan `null` en los accesorios. |
| `variantes` | Cada peso de bolsa (o la única variante de un accesorio), con precio y stock propios. |
| `resenas` | Reseñas de cada producto. |
| `profiles` | Un perfil por usuario de Supabase Auth, con su `role` (`cliente` o `admin`). |
| `ordenes` / `orden_items` | Pedidos y sus líneas (con la molienda elegida). Se usan desde el checkout. |

**Seguridad (RLS):** cualquiera puede ver los productos activos, sus variantes y reseñas; solo un admin los modifica. Cada usuario ve únicamente su perfil y sus órdenes. Un usuario puede cambiar su nombre, pero no su `role`.

## Estructura

```
app/                 páginas (App Router) y componentes
  components/        componentes compartidos (header, tarjetas, carrito, test…)
lib/
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

El historial de decisiones y prompts está en [`PROMPTS.md`](PROMPTS.md), y el contexto completo del proyecto en [`CLAUDE.md`](CLAUDE.md).
