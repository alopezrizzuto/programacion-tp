# CLAUDE.md — Contexto del Trabajo Integrador (Programación Web, PW 2026 Q1)

Este archivo lo leés al inicio de cada sesión. Contiene la consigna, las decisiones tomadas y las reglas de trabajo.

## Quién soy y cómo quiero trabajar

- Soy Agustín, estudiante. El proyecto es **individual** y lo tengo que **defender oralmente** (demo en vivo + preguntas técnicas). Tengo que entender todo lo que hay en el código.
- Hablame en **español rioplatense con voseo**.
- **Explicame siempre qué agregás, qué modificás y qué borrás, y por qué.** Antes de un cambio grande, contame el plan y esperá mi OK.
- Estoy aprendiendo React y Next.js desde cero (sé HTML, CSS y JS). Cuando aparezca un concepto nuevo (hook, Server Component, RLS, etc.), explicalo en 2–3 líneas.
- Preferí la solución **más simple que cumpla la rúbrica**. Nada de abstracciones o dependencias "por las dudas".
- Usá **JavaScript** (no TypeScript), salvo que yo diga lo contrario.
- Cuando algo falle o hagas algo mal y lo corrijamos, avisame para registrarlo en `PROMPTS.md`.

## El proyecto: tienda de manteles antimanchas

E-commerce de **un solo tipo de producto (mantel)** con variantes:
- Cada **producto** = un **diseño** (nombre, descripción, imagen, color/estilo). Seed: 8 a 12 diseños.
- Cada diseño tiene **variantes por medida** (ej. 1,40×1,40 / 1,40×2,00 / 1,40×2,50), cada una con **precio y stock** propios.

### Requisitos obligatorios
- Catálogo con **búsqueda y filtrado** (por texto, color/estilo, medida, rango de precio, con stock).
- **Carrito y checkout** con Mercado Pago (sandbox).
- **Usuarios**: registro, login y vista "Mis órdenes".
- **API interna** (Route Handlers) para productos y órdenes.
- **Supabase con SQL directo**: migraciones y seed en archivos `.sql` versionados.
- **Webhook** de Mercado Pago que actualiza el estado de la orden.
- **CRUD obligatorio**: panel admin para diseños, variantes y stock.
- **Despliegue con CI/CD** (GitHub Actions + Vercel) y demo pública.

### Decisiones de simplificación (ya acordadas)
- El **carrito vive en el cliente** (estado de React + `localStorage`). Recién se persiste al crear la orden.
- **Sin** cálculo de envío, cupones ni múltiples tipos de producto.
- Roles: `cliente` y `admin` (columna `role` en `profiles`).
- Pago con **Checkout Pro** (redirección a Mercado Pago).

### Modelo de datos (inicial, puede ajustarse)
- `profiles` (id → auth.users, nombre, role)
- `productos` (id, nombre, slug, descripcion, color, imagen_url, activo, created_at)
- `variantes` (id, producto_id → productos, medida, precio, stock)
- `ordenes` (id, user_id → auth.users, estado [pendiente | pagada | rechazada | cancelada], total, mp_preference_id, mp_payment_id, created_at)
- `orden_items` (id, orden_id → ordenes, variante_id → variantes, cantidad, precio_unitario)

Con **RLS**: el cliente solo ve sus órdenes; solo el admin modifica productos/variantes. El precio se toma siempre de la base al crear la orden, nunca del carrito del navegador.

## Stack
- **Next.js** (App Router) + React + Tailwind CSS
- **Supabase** (Postgres, Auth, RLS)
- **Mercado Pago** (Checkout Pro, sandbox + webhook)
- **Vercel** (deploy, preview por PR, variables de entorno)
- **GitHub Actions** (CI: lint + build; más adelante tests)
- **Playwright** (tests E2E, semana 8)

## Rúbrica (hay que sacar EXCELENTE en todos los ítems, si no se desaprueba)

| Entregable / Criterio | Qué pide "Excelente" | Peso |
|---|---|---|
| E1: Repo + pipeline + preview | Repo operativo, pipeline CI/CD y preview por PR funcionando | 10% |
| E2: Landing + vistas responsivas | Maquetado semántico, responsive, accesible y visualmente consistente | 15% |
| E3: Formularios con fetch + validación | DOM dinámico, validación robusta y fetch integrado correctamente | 15% |
| E4: Catálogo + API básica | Catálogo + API interna, lógica funcional y **checklist en PRs** | 20% |
| E5: CRUD en Supabase + admin | BD modelada, CRUD completo, persistencia y admin funcional | 20% |
| E6: Checkout + webhook | Pagos + webhooks, demo operativa y **pruebas exhaustivas** | 20% |
| Funcionalidad (transversal) | Completa, robusta y alineada a los objetivos | 40% |
| Código / Estructura | Limpio, modular, estructurado, buenas prácticas | 20% |
| Interfaz / Accesibilidad | Intuitiva, accesible y visualmente atractiva | 15% |
| Despliegue | Público, estable y accesible | 15% |
| Documentación | Completa, clara y alineada al proyecto | 10% |

Se valora el **desarrollo continuo**: commits frecuentes y entregas alineadas al cronograma. Hay revisión de código en cada PR.

## Cronograma

| Semana | Objetivo |
|---|---|
| 2 | E1: repo, CI (GitHub Actions), Vercel, preview por PR |
| 3 | E2: landing semántica, responsive y accesible + vistas clave |
| 4 | E3: formularios (registro/login, contacto) con validación y fetch |
| 5 | E4: catálogo con búsqueda/filtros + API interna (`/api/productos`) |
| 6 | E5: Supabase (migraciones, seed, Auth, RLS) + panel admin CRUD |
| 7 | E6: carrito, checkout Mercado Pago sandbox, webhook |
| 8 | Tests (Playwright), "Mis órdenes", documentación |
| 9 | Pulido, README final, ensayo de la demo |

## Convenciones de trabajo
- **Nunca trabajar directo en `main`.** Una rama por tarea (`feat/landing`, `fix/filtros`) y PR hacia `main`.
- Commits chicos y descriptivos, en español: `feat: agrega filtro por medida`.
- Cada PR lleva un **checklist** (qué se hizo, cómo se probó, capturas si hay UI).
- Secretos (claves de Supabase y Mercado Pago) solo en `.env.local` y en Vercel. **Nunca** commitearlos.
- Migraciones en `supabase/migrations/`, seed en `supabase/seed.sql`.
- Documentación en `README.md` (qué es, cómo correrlo, variables de entorno, arquitectura, decisiones).
- Bitácora de prompts en `PROMPTS.md`.
- La consigna original está en `docs/consigna.png`.
