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

E-commerce de **café en bolsa** con variantes, más una línea chica de **accesorios** (upsell):
- Cada **café** tiene nombre, origen, perfil, tostado, acidez, cuerpo, notas, descripción, imagen.
- Cada café tiene **variantes por peso de la bolsa** (250 g / 500 g / 1 kg), cada una con **precio y stock** propios. Seed: 6 cafés × 3 pesos = 18 variantes.
- **Accesorios** (4): vasos de doble vidrio (set x2), contenedor hermético al vacío, tamping set, balanza con timer. Una sola variante cada uno, sin molienda. Se muestran al final de `/productos` ("Accesorios para tu café"), tienen página propia `/accesorios/[slug]` y se ofrecen como upsell en el carrito.

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
- Vive en la **portada** (sección `#elegi`, link "Elegí tu café ideal" del header): el usuario elige 2 o 3 preferencias (sabor, con/sin leche, método), confirma y aparecen abajo los cafés recomendados con el motivo. Se puede reiniciar.
- Lógica **por reglas/puntaje (sin IA)** en `lib/recomendacion.js`. Hoy corre en el navegador; en **E3** pasa al Route Handler `POST /api/recomendacion` y el formulario la consulta con `fetch` (formulario dinámico + validación + fetch).
- Devuelve los cafés sugeridos (+ molienda y tamaño sugeridos), con botón para agregar al carrito.

### Identidad visual: "Tostadero"
- Inspirada en la bolsa de papel kraft y la bolsa de yute del café verde (origen, altura y lote estampados).
- Paleta (definida una sola vez en `app/globals.css`): tostado `#2A1A12` (dominante: secciones oscuras, header, botones), crema `#F3EBDD` (fondo de lectura), kraft `#D6C1A0` (superficies), marrón `#6B4A35` (texto secundario), cereza `#9A2E22` (único acento: solo descuentos y urgencia de stock).
- Tipografía: una sola familia, **Archivo** (variable en ancho), con `next/font`. Títulos anchos y pesados como un sello; texto a 17 px; números de ancho fijo para datos y precios.
- Evitar los "tics" de página generada: etiquetas en MAYÚSCULAS sobre cada título, textos unidos con "·", flechas "→" decorativas, numeración 01/02/03 si el contenido no es una secuencia.
- Un solo momento memorable: la animación de la portada al scrollear (grano → molinillo → portafiltro → taza), hecha con SVG y respetando "reducir movimiento". El resto, sobrio.

### Incentivos de conversión
Los valores viven en `lib/tienda.js` (un solo lugar para cambiarlos):
- **Bundles por café y peso:** 1 bolsa precio normal, 2 bolsas −10% ("Más vendida"), 3 bolsas −20% ("Mejor precio"). El **10% OFF por transferencia** se aplica encima del total.
- 6 cuotas sin interés · envío gratis desde $100.000 con **barra dinámica** de cuánto falta (header del carrito y página de producto).
- **Fecha de entrega calculada** (hora de Argentina): compra antes de las 14:00 se despacha ese día hábil; si no, el siguiente. Llega de 1 a 4 días hábiles después del despacho. Saltea fines de semana (no feriados).
- Urgencia honesta (stock real), garantías de compra y envío, reseñas, estadísticas, FAQ y prueba social ("+10.000 personas").
- **Prueba social, reseñas y estadísticas son datos de ejemplo.** El footer aclara que es una tienda de demostración (proyecto académico).
- Antes de E6: el servidor recalcula bundles y descuento por transferencia al crear la orden (nunca confiar en el total del navegador).

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
- El **carrito vive en el cliente** (estado de React + `localStorage`). Recién se persiste al crear la orden. Se abre como panel lateral (con upsell de accesorios minimizable) y también existe la página `/carrito`.
- **Sin** cálculo de costo de envío por zona ni cupones. El envío es gratis desde $100.000; debajo se muestra como "a calcular" (se define antes de E6).
- Roles: `cliente` y `admin` (columna `role` en `profiles`).
- Pago con **Checkout Pro** (redirección a Mercado Pago).

### Modelo de datos (inicial, puede ajustarse)
- `profiles` (id → auth.users, nombre, role)
- `productos` (id, categoria [cafe | accesorio], nombre, slug, descripcion, origen, perfil [frutal | equilibrado | intenso], tostado [claro | medio | medio-oscuro | oscuro], acidez 1–5, cuerpo 1–5, notas text[], imagen_url, activo, created_at). Los campos de café (origen, perfil, tostado, acidez, cuerpo, notas) quedan `null` en los accesorios.
- `variantes` (id, producto_id → productos, nombre [ej. "250 g", "Set x2"], peso_gramos (null en accesorios), precio, stock)
- `ordenes` (id, user_id → auth.users, estado [pendiente | pagada | rechazada | cancelada], total, mp_preference_id, mp_payment_id, created_at)
- `orden_items` (id, orden_id → ordenes, variante_id → variantes, molienda (null en accesorios), cantidad, precio_unitario)

Los valores cerrados (categoria, perfil, tostado, molienda) y los rangos (acidez y cuerpo de 1 a 5) se validan con `CHECK` en la base.

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
| 3 | E2: landing semántica, responsive y accesible + vistas clave ✅ · Rediseño "Tostadero" + accesorios + carrito en el cliente (en curso) |
| 4 | **E5 adelantado (lo pidió la cátedra):** Supabase (migraciones, seed, Auth, RLS) + panel admin CRUD. Junto con **E3**: login/registro contra Supabase con validación y fetch |
| 5 | E3 (resto): contacto y cuestionario vía `POST /api/recomendacion` · E4: búsqueda/filtros + API interna (`/api/productos`) |
| 6 | Margen / pulido de E3–E5 |
| 7 | E6: checkout Mercado Pago sandbox, webhook (el carrito ya existe en el cliente) |
| 8 | Tests (Playwright), "Mis órdenes", documentación |
| 9 | Pulido, README final, ensayo de la demo |

## Pendientes de Agustín (no dar por hechos)
Mientras no estén, el sitio usa reemplazos provisorios (bloque beige con un grano dibujado y el nombre en texto como logo).
- [ ] **6 fotos de producto** (una por café, la bolsa; no hace falta una por peso). Cuadradas 1200×1200 px, JPG o WebP, mismo fondo crema/beige, misma luz y ángulo. En `public/cafes/` con el slug como nombre: `etiopia-yirgacheffe.jpg`, `kenia-aa.jpg`, `colombia-huila.jpg`, `guatemala-antigua.jpg`, `brasil-cerrado.jpg`, `blend-espresso.jpg`. Al tenerlas: completar `imagen` de cada café en `lib/cafes.js`.
- [ ] **Foto principal de la portada** (opcional): horizontal 1920×1080 px, `public/hero.jpg`.
- [ ] **Logo horizontal** (ícono + "Origen Café"): SVG o PNG transparente, `public/logo.svg`. Reemplaza el texto del `Header`.
- [ ] **Ícono cuadrado** para la pestaña del navegador: PNG 512×512, `app/icon.png` (reemplaza `app/favicon.ico`).
- [ ] **4 fotos de accesorios** (mismas reglas que las de café), en `public/accesorios/` con el slug como nombre.
- [ ] **Video del proceso** (opcional, reemplaza la animación SVG de la portada): grano → molinillo → portafiltro → taza, vertical u horizontal, sin audio, MP4 corto (< 8 MB).
- [ ] **Videos de clientes** extrayendo café (2 o 3, verticales, MP4 cortos) para la página de producto. Hasta tenerlos se muestran espacios reservados.

## Próxima tarea (después del rediseño)
**Supabase + autenticación + panel admin** (E5 adelantado, y cubre parte de E3):
1. Proyecto en Supabase, variables en `.env.local` y en Vercel.
2. Migraciones en `supabase/migrations/` con el modelo de datos de arriba (incluye `categoria` y accesorios), `CHECK`s y RLS.
3. `supabase/seed.sql` con los 6 cafés × 3 pesos y los 4 accesorios (los datos de `lib/cafes.js` y `lib/accesorios.js`).
4. Las páginas leen de Supabase en lugar de los archivos de ejemplo.
5. Registro y login con Supabase Auth (validación en el formulario + fetch), `profiles` con `role`.
6. Panel `/admin` (solo `role = admin`): CRUD de productos (cafés y accesorios), variantes y stock, para manejar la tienda sin tocar código.

## Convenciones de trabajo
- **Nunca trabajar directo en `main`.** Una rama por tarea (`feat/landing`, `fix/filtros`) y PR hacia `main`.
- Commits chicos y descriptivos, en español: `feat: agrega filtro por tostado`.
- Cada PR lleva un **checklist** (qué se hizo, cómo se probó, capturas si hay UI).
- Secretos (claves de Supabase y Mercado Pago) solo en `.env.local` y en Vercel. **Nunca** commitearlos.
- Migraciones en `supabase/migrations/`, seed en `supabase/seed.sql`.
- Documentación en `README.md` (qué es, cómo correrlo, variables de entorno, arquitectura, decisiones).
- Bitácora de prompts en `PROMPTS.md`.
- La consigna original está en `docs/consigna.png`.
