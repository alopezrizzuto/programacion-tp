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

## El proyecto: Origen Café, tienda de café de especialidad

E-commerce de **un solo tipo de producto (café en bolsa)** con variantes:
- Cada **producto** = un **café** (nombre, origen, perfil, tostado, acidez, cuerpo, notas, descripción, imagen).
- Cada café tiene **variantes por peso de la bolsa** (250 g / 500 g / 1 kg), cada una con **precio y stock** propios. Seed: 6 cafés × 3 pesos = 18 variantes.

### Los 6 cafés (3 perfiles, 2 cafés por perfil)

| Perfil | Café | Tostado | Acidez | Cuerpo | Notas |
|---|---|---|---|---|---|
| Frutal y brillante | Etiopía Yirgacheffe | claro | alta | ligero | florales, cítricas |
| Frutal y brillante | Kenia AA | claro | alta | medio | frutos rojos |
| Equilibrado | Colombia Huila | medio | media | medio | caramelo, manzana |
| Equilibrado | Guatemala Antigua | medio | media | medio | chocolate, especias |
| Intenso | Brasil Cerrado | medio-oscuro | baja | alto | chocolate, maní |
| Intenso | Blend Espresso | oscuro | baja | alto | cacao amargo |

### Molienda (opción del pedido, NO variante)
- Se elige al comprar y se guarda en el ítem de la orden (`orden_items.molienda`). **No cambia el precio.**
- Opciones: `grano entero`, `fina` (espresso), `media-fina` (moka), `media` (filtro/V60), `gruesa` (prensa francesa).
- No es variante para no multiplicar el stock: 6 cafés × 3 pesos × 5 moliendas serían 90 combinaciones. El stock es por café y peso.

### "Elegí tu café" (cuestionario de recomendación)
- Formulario de 4 preguntas:
  1. **Método de preparación** → define la molienda.
  2. **Solo o con leche** → con leche suma puntos a los cafés de cuerpo alto.
  3. **Sabores preferidos** → suma puntos al perfil correspondiente.
  4. **Consumo semanal** → define el tamaño de bolsa.
- Lógica **por reglas/puntaje (sin IA)**, calculada en el Route Handler `POST /api/recomendacion`.
- Devuelve **café + molienda + tamaño sugeridos**, con botón para agregar al carrito.
- Se implementa en la semana 4 como parte de **E3** (formulario dinámico + validación + fetch).

### Identidad visual
- Paleta (definida una sola vez en `app/globals.css`): crema `#F7F2EA` (fondo), beige `#E8DCCB` (superficies), espresso `#2B1D14` (texto y botones), marrón café `#5C3D2E` (secundario), caramelo `#A67B5B` (solo decorativo: no alcanza contraste para texto chico).
- Estética premium minimalista: mucho aire, títulos con serifa (Cormorant Garamond) y texto en sans (Inter), ambas con `next/font`.

### Incentivos de conversión
Los valores viven en `lib/tienda.js` (un solo lugar para cambiarlos):
- 10% OFF pagando por transferencia · 6 cuotas sin interés · envío gratis desde $100.000 · 5% OFF llevando 2 bolsas o más.
- Tiempos de envío (CABA/GBA 24–48 h hábiles, interior 3–5 días hábiles), "tostado esta semana", aviso de stock bajo y reseñas en el detalle del café.
- **En E2 son solo mensajes.** Antes de E6 hay que decidir cuáles se aplican de verdad al total de la orden (el descuento por cantidad es fácil de calcular en el servidor) y sacar o aclarar los que no, para que la demo sea coherente.
- Las reseñas son datos de ejemplo. El footer aclara que es una tienda de demostración (proyecto académico).

### Requisitos obligatorios
- Catálogo con **búsqueda y filtrado**: perfil, tostado, acidez, cuerpo, origen, peso, rango de precio, con stock y búsqueda por texto (nombre, origen, notas).
- **Carrito y checkout** con Mercado Pago (sandbox).
- **Usuarios**: registro, login y vista "Mis órdenes".
- **API interna** (Route Handlers) para productos y órdenes.
- **Supabase con SQL directo**: migraciones y seed en archivos `.sql` versionados.
- **Webhook** de Mercado Pago que actualiza el estado de la orden.
- **CRUD obligatorio**: panel admin para cafés, variantes y stock.
- **Despliegue con CI/CD** (GitHub Actions + Vercel) y demo pública.

### Decisiones de simplificación (ya acordadas)
- El **carrito vive en el cliente** (estado de React + `localStorage`). Recién se persiste al crear la orden.
- **Sin** cálculo de envío, cupones ni múltiples tipos de producto.
- Roles: `cliente` y `admin` (columna `role` en `profiles`).
- Pago con **Checkout Pro** (redirección a Mercado Pago).

### Modelo de datos (inicial, puede ajustarse)
- `profiles` (id → auth.users, nombre, role)
- `productos` (id, nombre, slug, descripcion, origen, perfil [frutal | equilibrado | intenso], tostado [claro | medio | medio-oscuro | oscuro], acidez 1–5, cuerpo 1–5, notas text[], imagen_url, activo, created_at)
- `variantes` (id, producto_id → productos, peso_gramos, precio, stock)
- `ordenes` (id, user_id → auth.users, estado [pendiente | pagada | rechazada | cancelada], total, mp_preference_id, mp_payment_id, created_at)
- `orden_items` (id, orden_id → ordenes, variante_id → variantes, molienda, cantidad, precio_unitario)

Los valores cerrados (perfil, tostado, molienda) y los rangos (acidez y cuerpo de 1 a 5) se validan con `CHECK` en la base.

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
| 4 | E3: formularios (registro/login, contacto, cuestionario "Elegí tu café") con validación y fetch |
| 5 | E4: catálogo con búsqueda/filtros + API interna (`/api/productos`) |
| 6 | E5: Supabase (migraciones, seed, Auth, RLS) + panel admin CRUD |
| 7 | E6: carrito, checkout Mercado Pago sandbox, webhook |
| 8 | Tests (Playwright), "Mis órdenes", documentación |
| 9 | Pulido, README final, ensayo de la demo |

## Pendientes de Agustín (no dar por hechos)
Mientras no estén, el sitio usa reemplazos provisorios (bloque beige con un grano dibujado y el nombre en texto como logo).
- [ ] **6 fotos de producto** (una por café, la bolsa; no hace falta una por peso). Cuadradas 1200×1200 px, JPG o WebP, mismo fondo crema/beige, misma luz y ángulo. En `public/cafes/` con el slug como nombre: `etiopia-yirgacheffe.jpg`, `kenia-aa.jpg`, `colombia-huila.jpg`, `guatemala-antigua.jpg`, `brasil-cerrado.jpg`, `blend-espresso.jpg`. Al tenerlas: completar `imagen` de cada café en `lib/cafes.js`.
- [ ] **Foto principal de la portada** (opcional): horizontal 1920×1080 px, `public/hero.jpg`.
- [ ] **Logo horizontal** (ícono + "Origen Café"): SVG o PNG transparente, `public/logo.svg`. Reemplaza el texto del `Header`.
- [ ] **Ícono cuadrado** para la pestaña del navegador: PNG 512×512, `app/icon.png` (reemplaza `app/favicon.ico`).

## Convenciones de trabajo
- **Nunca trabajar directo en `main`.** Una rama por tarea (`feat/landing`, `fix/filtros`) y PR hacia `main`.
- Commits chicos y descriptivos, en español: `feat: agrega filtro por tostado`.
- Cada PR lleva un **checklist** (qué se hizo, cómo se probó, capturas si hay UI).
- Secretos (claves de Supabase y Mercado Pago) solo en `.env.local` y en Vercel. **Nunca** commitearlos.
- Migraciones en `supabase/migrations/`, seed en `supabase/seed.sql`.
- Documentación en `README.md` (qué es, cómo correrlo, variables de entorno, arquitectura, decisiones).
- Bitácora de prompts en `PROMPTS.md`.
- La consigna original está en `docs/consigna.png`.
