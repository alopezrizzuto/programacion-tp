# Origen Café

Tienda online de café de especialidad: 6 cafés en bolsa (250 g, 500 g y 1 kg, con la molienda a elección) y 4 accesorios. Trabajo integrador de Programación Web (ITBA, 2026 Q1).

**Demo pública:** https://programacion-tp-black.vercel.app

> Es una tienda de demostración: las reseñas, estadísticas y pagos son de ejemplo.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4**, en JavaScript.
- **Supabase**: base de datos Postgres con SQL directo (migraciones y seed versionados), Auth y RLS.
- **Vercel** para el despliegue (con preview por PR) y **GitHub Actions** para CI (lint, tests unitarios, build y tests E2E).
- **Mercado Pago** Checkout Pro (sandbox) con webhook.
- **Tests:** unitarios con el runner de Node (`node:test`) y E2E con **Playwright**.
- Próximamente: email de confirmación (Resend).

## Cómo correrlo

Requisitos: Node 20 o más nuevo y un proyecto de Supabase.

```bash
npm install
cp .env.example .env.local   # y completar los valores (ver abajo)
npm run dev                  # http://localhost:3000
```

Otros scripts: `npm run lint`, `npm run build`, `npm start`, `npm test` (unitarios) y `npm run test:e2e` (E2E, ver [Tests](#tests)).

### Variables de entorno

| Variable | Dónde se consigue | ¿Es secreta? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API (URL base, sin `/rest/v1`) | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key | No: es pública, la protección la da RLS |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret keys (`sb_secret_…`) | **Sí** |
| `MERCADOPAGO_ACCESS_TOKEN` | Mercado Pago Developers → tu aplicación → Credenciales de prueba → Access Token | **Sí** |
| `MERCADOPAGO_WEBHOOK_SECRET` | Mercado Pago Developers → tu aplicación → Webhooks → Configurar notificaciones → clave secreta | **Sí** |
| `MERCADOPAGO_SANDBOX` | `true` mientras se usen credenciales de prueba (ver "Probar un pago") | No |

- Las dos **públicas** van en `.env.local`, en Vercel (Settings → Environment Variables, en Production, Preview y Development) y en GitHub (Settings → Secrets and variables → Actions → **Variables**), porque el build de CI lee el catálogo de la base.
- Las tres **secretas** van solo en `.env.local` y en Vercel (marcadas como *Sensitive*). Nunca se commitean ni llegan al navegador: no empiezan con `NEXT_PUBLIC_` y solo las leen los Route Handlers y las páginas del servidor.

### Base de datos

En el **SQL Editor** de Supabase, ejecutar en orden el contenido de:

1. `supabase/migrations/001_esquema.sql`: tablas, `CHECK`s, índices y el trigger que crea el perfil de cada usuario nuevo.
2. `supabase/migrations/002_seguridad.sql`: función `es_admin()` y políticas RLS.
3. `supabase/seed.sql`: los 6 cafés con sus 18 variantes, los 4 accesorios y las reseñas de ejemplo.
4. `supabase/migrations/003_imagenes.sql`: bucket `productos` de Supabase Storage para las fotos (lectura pública, solo el admin sube o borra).
5. `supabase/migrations/004_checkout.sql`: pedidos sin cuenta (código de seguimiento), datos de envío, medio de pago, montos y la función `confirmar_pago` (marca el pedido como pagado y descuenta el stock en una sola transacción).
6. `supabase/migrations/005_mensajes.sql`: mensajes del formulario de contacto (solo el admin los lee).

En el plan gratis, Supabase pausa el proyecto después de 7 días sin uso: el workflow `mantener-supabase.yml` hace una consulta diaria para evitarlo.

## Modelo de datos

| Tabla | Para qué |
|---|---|
| `productos` | Cafés y accesorios (`categoria`). Los campos de café (origen, perfil, tostado, acidez, cuerpo, notas) quedan `null` en los accesorios. |
| `variantes` | Cada peso de bolsa (o la única variante de un accesorio), con precio y stock propios. |
| `resenas` | Reseñas de cada producto. |
| `profiles` | Un perfil por usuario de Supabase Auth, con su `role` (`cliente` o `admin`). |
| `ordenes` / `orden_items` | Pedidos (código de seguimiento, email, envío, medio de pago, montos y estado) y sus líneas (con la molienda y el nombre del producto al comprarlo). |

**Seguridad (RLS):** cualquiera puede ver los productos activos, sus variantes y reseñas; solo un admin los modifica. Cada usuario ve únicamente su perfil y sus órdenes. Los pedidos los crea y actualiza solo el servidor, con la clave secreta. Un usuario puede cambiar su nombre, pero no su `role`.

## Catálogo: búsqueda y filtros

`/productos` tiene una barra lateral (en el celular, un botón "Filtros" que la despliega) para buscar por texto (nombre, origen y notas, sin importar tildes ni mayúsculas) y filtrar por perfil, tostado, acidez y cuerpo (baja 1–2, media 3, alta 4–5), país de origen (el blend aparece en Brasil y en Colombia), peso de la bolsa, rango de precio y solo con stock.

- **Los filtros viven en la URL** (`/productos?perfil=frutal&acidez=alta&q=jazmin`): el link se puede compartir y al volver de un producto siguen puestos. Los que admiten varios valores se repiten (`?perfil=frutal&perfil=intenso`).
- Es un **formulario GET** común: sin JavaScript funciona con el botón "Ver resultados". Con JavaScript cada cambio se aplica solo (la búsqueda por texto, cuando dejás de escribir) y la página se vuelve a armar en el servidor.
- La página y la API usan **las mismas funciones** (`lib/catalogo.js`): `leerFiltros` valida (solo valores de la lista, precios enteros, mínimo menor que máximo, búsqueda de hasta 60 caracteres) y `filtrarProductos` filtra. Cada producto vuelve solo con las variantes que cumplen peso, precio y stock, así la tarjeta muestra el precio de lo que buscaste.
- Los filtros propios del café (perfil, tostado, acidez, cuerpo, origen y peso) ocultan los accesorios; la búsqueda, el precio y el stock aplican a todo.
- Accesibilidad: cada grupo es un `fieldset` con su `legend`, las opciones son casillas reales (se ven como pastillas y funcionan con Tab y espacio) y la cantidad de resultados se anuncia al lector de pantalla (`role="status"`).

| Ruta | Qué hace |
|---|---|
| `GET /api/productos` | Catálogo público con los mismos filtros que la página: `q`, `perfil`, `tostado`, `acidez`, `cuerpo` (`baja`, `media`, `alta`), `origen`, `peso` (`250`, `500`, `1000`), `precioMin`, `precioMax` y `stock=1`. Devuelve `{ total, filtros, productos }`; 400 con un mensaje por campo si algún filtro no es válido. |

Ejemplo: `/api/productos?perfil=intenso&peso=1000&stock=1`.

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

## Checkout y pedidos

Se puede comprar **sin cuenta**: alcanza con el email. Si hay sesión, el pedido también queda en Mis pedidos.

1. **`/checkout`**: contacto, envío y medio de pago (validación compartida en `lib/validacion-checkout.js`). Se envía con `fetch` a `POST /api/ordenes` solo qué variante, qué molienda y cuántas: **precios, stock, bundles, 10% OFF y envío se recalculan en el servidor** con `armarOrden` (`lib/ordenes.js`), que reutiliza `calcularCarrito`.
2. **Mercado Pago:** el servidor crea una *preferencia* de Checkout Pro (con `fetch`, sin SDK) por el total exacto del pedido y la persona paga en Mercado Pago. Después vuelve a `/seguimiento/<código>`.
3. **Transferencia (10% OFF en los productos):** el pedido queda pendiente y se muestran los datos para transferir (de ejemplo). El admin confirma el pago desde el panel.
4. **Webhook `POST /api/webhooks/mercadopago`:** verifica la firma `x-signature` (HMAC-SHA256 con la clave secreta del webhook), consulta el pago a la API de Mercado Pago (nunca le cree al aviso), controla que el monto coincida y llama a `confirmar_pago`. Si llega dos veces el mismo aviso, el stock no se descuenta dos veces.
5. **`/seguimiento`**: cualquiera con el código (`OC-` y 10 caracteres al azar, imposible de adivinar) ve el estado del pedido, sus productos y el envío, y puede reintentar el pago.

Estados: pendiente → pagada → enviada → entregada (o rechazada / cancelada). El envío cuesta $6.500 en compras de menos de $100.000 (`lib/tienda.js`). El stock se descuenta al confirmarse el pago y no al crear el pedido: así un pedido abandonado no bloquea stock.

| Ruta | Qué hace |
|---|---|
| `POST /api/ordenes` | Crea el pedido. Devuelve `{ codigo }` o `{ codigo, linkPago }` (Mercado Pago). 400 con errores por campo, 409 si falta stock o algo cambió. |
| `POST /api/webhooks/mercadopago` | Recibe los avisos de pago de Mercado Pago (401 si la firma no es válida). |
| `PATCH /api/ordenes/:id` | Solo admin: cambia el estado (`{ estado }`) según las transiciones permitidas. |

### Probar un pago (sandbox)

Con el Access Token de prueba y en una ventana de incógnito:

1. En el checkout, usar un email con el formato `test_user_123@testuser.com`. Con un email común, Mercado Pago responde *"Una de las partes con la que intentás hacer el pago es de prueba"*.
2. En Mercado Pago, elegir **Tarjeta** (sin cuenta): Mastercard `5031 7557 3453 0604`, vencimiento `11/30`, código `123`, DNI `12345678`.
3. El nombre del titular define el resultado: `APRO` aprobado, `OTHE` rechazado, `CONT` pendiente.

Para que el webhook funcione, Mercado Pago tiene que poder llegar a la URL: en Vercel (https), no en `localhost`. En Mercado Pago Developers → Webhooks se configura la URL **completa** `https://<dominio>/api/webhooks/mercadopago` con el evento **Pagos**, y la clave secreta que genera va en `MERCADOPAGO_WEBHOOK_SECRET`. (Con solo el dominio, los avisos llegan a la portada y Mercado Pago recibe 405.)

**La firma en el sandbox.** Con credenciales de prueba, el pago lo cobra la *cuenta vendedor de prueba* que crea Mercado Pago, y los avisos de pagos reales llegan firmados con la clave de esa cuenta, que no está disponible: la firma no coincide (la simulación del panel sí, porque la firma tu aplicación). Por eso, con `MERCADOPAGO_SANDBOX=true`, el webhook registra una advertencia y sigue. No es un agujero: lo que protege de verdad es que el pago se le consulta a Mercado Pago con nuestro token y solo se confirma si está aprobado, es de ese pedido y el monto coincide. Con credenciales reales, sin esa variable, la firma se exige siempre.

## Contacto

`/contacto` tiene un formulario (nombre, email, motivo y mensaje) con la misma forma de trabajar que los otros: validación compartida en `lib/validacion-contacto.js`, envío con `fetch` a `POST /api/contacto` y errores por campo. El servidor guarda el mensaje con la clave secreta en la tabla `mensajes` (no hay política de insert para visitantes). Para frenar spam sin dependencias tiene un campo trampa invisible: si viene completo, lo llenó un bot y se descarta en silencio.

| Ruta | Qué hace |
|---|---|
| `POST /api/contacto` | Guarda un mensaje. 400 con errores por campo. |
| `PATCH /api/mensajes/:id` | Solo admin: marca un mensaje como leído o no (`{ leido }`). |

## Test "Elegí tu café ideal"

En la portada (`#elegi`), cuatro preguntas de a una: intensidad, acidez, si lo toma con leche y cómo lo prepara. La recomendación es por reglas y puntaje, sin IA (`lib/recomendacion.js`), y la calcula el servidor:

- **En el navegador** (`app/components/TestCafe.js`), `validarRespuestas` avisa al instante qué preguntas faltan y lleva a la primera sin responder, sin ir al servidor.
- **Con `fetch`**, las respuestas van a `POST /api/recomendacion`, que las vuelve a validar, lee los cafés de Supabase y devuelve los 3 que mejor encajan.
- Mientras espera, el botón dice "Buscando tu café…" y los resultados quedan con `aria-busy`. Si el servidor falla o no hay conexión, se muestra un mensaje y se puede reintentar.
- Si la persona cambia una respuesta después de ver los resultados, se vuelve a consultar y el pedido anterior se cancela (`AbortController`), así nunca se muestra una respuesta vieja.

| Ruta | Qué hace |
|---|---|
| `POST /api/recomendacion` | Recibe `{ intensidad, acidez, leche, metodo }` y devuelve `{ resultados }`: los 3 cafés con stock que mejor encajan, cada uno con su `coincidencia` (%), los `motivos` y la `molienda` sugerida. 400 con `{ error }` si falta una respuesta o alguna no es una de las opciones. |

Ejemplo: `{ "intensidad": "fuerte", "acidez": "poco", "leche": "con-leche", "metodo": "espresso" }` recomienda Brasil Cerrado y Blend Espresso, molidos finos.

## Panel admin

En `/admin` (link "Panel admin" en el menú de la cuenta) un usuario con `role = 'admin'` maneja la tienda sin tocar código:

- **Resumen:** productos visibles, variantes sin stock, pedidos pagados para preparar y la lista de variantes para reponer.
- **Pedidos:** filtros (para preparar, esperando pago, enviados, todos), detalle de productos y envío, y botones para confirmar el pago, marcar como enviado o entregado y cancelar.
- **Mensajes:** lo que llega por el formulario de contacto, del más nuevo al más viejo, con los no leídos destacados, link para responder por email y botón para marcarlos como leídos.
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

## Tests

Corren en cada PR y en cada push a `main` (GitHub Actions). Hay dos tipos:

**Unitarios** (`tests/unit/`, `npm test`): prueban la lógica pura de `lib/` con el runner que trae Node (`node:test`), sin base ni navegador, en menos de un segundo. Usan un catálogo chico y fijo (`catalogo-de-prueba.js`) para que cada cuenta se pueda verificar a mano.

| Archivo | Qué prueba |
|---|---|
| `carrito.test.js` | Bundles (por café y peso, sumando moliendas), envío gratis desde $100.000, 10% OFF por transferencia. |
| `ordenes.test.js` | `armarOrden`: el precio sale del catálogo (no del navegador), stock sumando moliendas, cantidades y moliendas inválidas, código de seguimiento. |
| `mercadopago.test.js` | Firma del webhook (correcta, de otro pago, con otra clave, mal armada) y `decidirPago` (aprobado, monto alterado, rechazado, pendiente). |
| `catalogo.test.js` | Validación de filtros de la URL, búsqueda sin tildes, el blend en dos orígenes, filtrado de variantes. |
| `recomendacion.test.js` | Validación de respuestas y que cada perfil de persona reciba el café y la molienda esperados. |
| `validaciones.test.js` | Registro, ingreso, redirección segura después de ingresar, checkout y contacto. |
| `entrega.test.js` | Fecha de entrega: corte de las 14:00, fines de semana y la hora de Argentina. |

**E2E** (`tests/e2e/`, `npm run test:e2e`): Playwright levanta la tienda (build de producción) y la usa en un Chrome real, como una persona.

| Archivo | Qué prueba |
|---|---|
| `tienda.spec.js` | Portada, filtros en la URL, búsqueda vacía, filtro inválido, peso sin stock, 404 y que no haya scroll horizontal en el celular. |
| `test-cafe.spec.js` | El test de la portada: el `fetch` a la API, el resultado, agregar con la molienda sugerida y la validación sin ir al servidor. |
| `carrito.spec.js` | Agregar con molienda, bundle de 2 bolsas, que sobreviva a recargar (sin precios en `localStorage`), upsell y quitar. |
| `checkout.spec.js` | Errores por campo, compra por transferencia de punta a punta (con el total verificado en la base) y seguimiento por código. |
| `cuenta.spec.js` | Registro, email repetido, contraseña equivocada y que un pedido con sesión aparezca en Mis pedidos. |
| `admin.spec.js` | Sin sesión o sin rol no se entra (404 en la página, 403 en la API); el admin edita stock, crea y borra un café y confirma un pago (que descuenta el stock). |
| `contacto.spec.js` | Validación, mensaje guardado y el campo trampa contra bots. |
| `api.spec.js` | `/api/productos`, `/api/recomendacion`, `/api/ordenes` (precio manipulado, stock, datos inválidos) y el webhook (sin firma, firma falsa, firma de otro pago, firma correcta). |

**Base de prueba.** Los E2E crean pedidos, cuentas, mensajes y productos, así que usan un **proyecto de Supabase aparte**, nunca el de la tienda. Para armarlo:

1. Crear otro proyecto en Supabase y ejecutar en su SQL Editor las migraciones `001` a `005` y el `seed.sql`.
2. En Authentication → Sign In / Providers → Email, desactivar **Confirm email** (el test de registro entra directo).
3. Crear `.env.e2e.local` con `E2E_SUPABASE_URL`, `E2E_SUPABASE_PUBLISHABLE_KEY` y `E2E_SUPABASE_SECRET_KEY` de ese proyecto. Para el CI: las dos primeras en GitHub → Actions → **Variables** y la secreta en **Secrets**.

Antes de empezar, `tests/e2e/preparar.js` deja la base en un estado conocido: repone el stock del seed y crea (o actualiza) un admin y un cliente de prueba con una contraseña al azar por corrida. Al terminar, `tests/e2e/limpiar.js` borra todo lo que crearon los tests (se reconoce por el dominio de los emails y el prefijo `e2e-` de los productos). El servidor de los tests usa una clave de webhook inventada y ningún token de Mercado Pago: nunca se llama a su API.

Para correrlos en la compu:

```bash
npx playwright install chromium   # una sola vez
npm run test:e2e                  # build en .next-e2e + tests (unos minutos)
npx playwright show-report        # el reporte, con capturas si algo falló
```

**Lo que se prueba a mano.** El pago en Mercado Pago (la redirección a Checkout Pro y la tarjeta de prueba) no se puede automatizar: se prueba en la demo con la [lista de "Probar un pago"](#probar-un-pago-sandbox). Lo que hace el webhook con cada pago sí está cubierto por los unitarios (`decidirPago`) y los E2E (la firma).

## Estructura

```
app/                 páginas (App Router) y componentes
  admin/             panel admin (resumen, pedidos, lista de productos, formulario)
  checkout/          formulario de compra
  seguimiento/       búsqueda por código y página de cada pedido
  api/auth/          Route Handlers de la cuenta
  api/ordenes/, api/webhooks/mercadopago/   pedidos y avisos de pago
  productos/         catálogo con la barra de filtros (FiltrosCatalogo.js)
  api/productos/     catálogo con filtros (GET, público) y alta, edición y borrado (solo admin)
  api/variantes/, api/imagenes/   Route Handlers del panel admin
  api/recomendacion/ el test "Elegí tu café ideal" (POST)
  components/        componentes compartidos (header, tarjetas, carrito, sesión, test…)
proxy.js             renueva la sesión antes de las páginas que la usan
lib/
  auth.js            validación de los formularios de cuenta (navegador y servidor)
  admin.js           chequeo de rol admin, errores de la base y regeneración de la tienda
  validacion-producto.js   validación del formulario de productos (navegador y servidor)
  validacion-checkout.js   validación del checkout (navegador y servidor)
  ordenes.js         armado de la orden, estados y código de seguimiento (funciones puras)
  mercadopago.js     preferencia, consulta de pagos y verificación de la firma del webhook
  supabase/          clientes de Supabase: con la sesión del usuario (cookies) y con la clave secreta (solo servidor)
  datos.js           lecturas del catálogo desde Supabase
  catalogo.js        búsqueda y filtros del catálogo: validación y filtrado (página y API)
  productos.js       perfiles, tostados, moliendas y helpers de producto
  tienda.js          promociones (bundles, transferencia, cuotas, envío gratis)
  carrito.js         cálculo puro del carrito (lo reutiliza el servidor al crear la orden)
  recomendacion.js   preguntas, validación (navegador y servidor) y puntaje del test "Elegí tu café ideal"
supabase/
  migrations/        esquema y seguridad en SQL
  seed.sql           datos iniciales
tests/
  unit/              tests unitarios de lib/ (node --test)
  e2e/               tests E2E con Playwright, y la preparación y limpieza de la base de prueba
playwright.config.js cómo se levanta la tienda para los E2E (base de prueba, puerto 3100)
```

## Decisiones

- **El catálogo se lee en el servidor** y las páginas se regeneran cada 5 minutos (`revalidate = 300`), así un cambio en la base aparece sin volver a desplegar. `/productos` es la excepción: depende de los filtros de la URL, así que se arma en cada visita.
- **El carrito vive en el navegador** (`localStorage`) y guarda solo variante, molienda y cantidad, nunca precios: los totales se recalculan siempre con los precios de la base.
- **La molienda no es una variante:** se elige al comprar y no cambia el precio ni el stock.
- **Las reglas de negocio están en la base:** valores cerrados y rangos con `CHECK`, permisos con RLS.
- **Diseño:** el producto es protagonista (imagen grande sobre fondo de estudio, tarjetas con poco texto) y el movimiento vive solo en la portada: el hero interactivo es un video grande del grano a la taza que avanza con el scroll (con suavizado, para que un scroll rápido no saltee la historia) (`app/components/HeroRecorrido.js` y `public/video/proceso.mp4`) y debajo aparece la foto de las tres bolsas (`PresentacionCafes.js`). Todo respeta "reducir movimiento". Las fotos de producto y la del hero se generaron con IA a partir de una misma foto de referencia (misma bolsa, luz y fondo); un producto sin foto se muestra con una bolsa kraft ilustrada (`app/components/BolsaCafe.js`).
- **Una sola validación para el navegador y el servidor** (`lib/auth.js`, `lib/validacion-producto.js`, `lib/validacion-checkout.js`, `lib/validacion-contacto.js`, `lib/recomendacion.js`): el navegador avisa antes de enviar, y el servidor no confía en lo que llega.
- **Se compra sin cuenta**, con un código de seguimiento: menos pasos para comprar. La clave secreta de Supabase se usa solo en el servidor, para lo que no depende de una sesión (crear pedidos, el webhook y el seguimiento por código).

El historial de decisiones y prompts está en [`PROMPTS.md`](PROMPTS.md), y el contexto completo del proyecto en [`CLAUDE.md`](CLAUDE.md).
