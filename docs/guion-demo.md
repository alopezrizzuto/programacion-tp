# Guion de la exposición: Origen Café (10 minutos)

Sigue la consigna de la exposición oral. Son 10 minutos de exposición y demo en vivo, con tiempos aproximados, más las preguntas técnicas probables con una respuesta corta. El detalle de cada tema está en el [README](../README.md).

| Tiempo | Bloque | Qué pide la consigna |
|---|---|---|
| 0:00 – 0:45 | 1. Qué es y cómo cambió | Funcionalidades distintivas; solución inicial frente a final |
| 0:45 – 2:00 | 2. Tecnologías e IA | Cada tecnología e IA: para qué, por qué y cómo se integra |
| 2:00 – 2:45 | 3. Arquitectura y recorrido de los datos | Interfaz, servidor y base de datos |
| 2:45 – 6:15 | 4. Demo en vivo | Funcionalidades principales |
| 6:15 – 7:30 | 5. Base de datos | Estructura, relaciones, consultas, ABM, validación y permisos |
| 7:30 – 9:00 | 6. Prompts: el mejor, el peor y cómo se corrigieron | Qué se buscaba, qué cambió al modificar la instrucción y cómo se revisó |
| 9:00 – 10:00 | 7. Dificultades, limitaciones y calidad | Dificultades, soluciones y pendientes |

## Antes de empezar

- [ ] **Ventana 1, incógnito:** https://programacion-tp-black.vercel.app, sin sesión (cliente).
- [ ] **Ventana 2:** la misma demo, logueado como **admin** y abierta en `/admin/pedidos?filtro=pago`.
- [ ] **Pestañas preparadas:**
  - README en GitHub, en la sección Tecnologías, el diagrama de la base y la Arquitectura;
  - Supabase Table Editor en `variantes`;
  - GitHub Actions con un CI en verde.
- [ ] **Datos a mano:**
  - usuario y contraseña del **comprador de prueba** de Mercado Pago (hay que ingresar con él: como invitado, Mercado Pago rechaza el pago);
  - tarjeta `5031 7557 3453 0604`, `11/30`, código `123`, DNI `12345678`;
  - titular `APRO`.
- [ ] Anotar el stock de **Colombia Huila 250 g** para mostrar que baja.
- [ ] **Plan B:** si falla la red, `npm run dev` en la compu; el pago se confirma a mano desde el admin.
- [ ] Reloj a la vista: la demo no puede pasar de 3:30.

## 1. Qué es y cómo cambió (0:45)

- "Origen Café es una tienda de café de especialidad: 6 cafés en 3 pesos, la molienda se elige al comprar, y hay 4 accesorios. Se puede comprar sin cuenta, con Mercado Pago o transferencia, y seguir el pedido con un código."
- **Lo distintivo:**
  - el test "Elegí tu café ideal", que recomienda café y molienda;
  - el hero, un video que avanza con el scroll;
  - los packs con descuento;
  - la fecha de entrega calculada.
- **Cómo cambió:** empezó como una tienda de manteles. El primer día pasó a café, porque tenía filtros con más sentido y una funcionalidad propia. Además, la molienda pasó de variante a opción del pedido, el test pasó del navegador a una API y el hero pasó de un video común a uno que avanza con el scroll.

## 2. Tecnologías e IA (1:15)

Mostrar la tabla del README.

- **Next.js 16 con App Router y React 19, en JavaScript:** interfaz y API en un solo proyecto. Los Server Components leen la base sin exponer claves.
- **Tailwind v4** para el diseño responsive.
- **Supabase:** Postgres con SQL directo, como pide la consigna, más Auth, Storage para las fotos y RLS para los permisos.
- **Mercado Pago Checkout Pro**, con `fetch` y sin SDK: los datos de tarjeta nunca pasan por la tienda.
- **Vercel** para el deploy, con una preview por PR. **GitHub Actions** para el CI.
- **Tests:** Playwright para los E2E y `node:test` para los unitarios.
- **IA:**
  - claude.ai para evaluar la idea y planificar;
  - **Claude Code** para desarrollar, con el contexto en `CLAUDE.md`;
  - **Higgsfield** para las fotos (GPT Image 2.5) y el video (Kling 3.0);
  - la **skill de seguridad de Cloudflare** para la auditoría.

## 3. Arquitectura y recorrido de los datos (0:45)

Mostrar el esquema de "Arquitectura" del README y contar el recorrido de una compra:

> "El carrito vive en el navegador y guarda solo ids y cantidades. El checkout valida y manda los datos con `fetch` a `POST /api/ordenes`. El servidor vuelve a validar, lee los precios de Supabase y guarda el pedido. Después le pide a Mercado Pago el link de pago. Cuando la persona paga, Mercado Pago avisa al webhook: verificamos la firma, le preguntamos el pago a Mercado Pago y una función SQL marca el pedido como pagado y descuenta el stock."

## 4. Demo en vivo (3:30)

1. **Portada (0:30):** bajar por el hero. En el test, elegir Fuerte, Poco, Con leche y Espresso y tocar "Ver mi café": la recomendación sale de `POST /api/recomendacion`.
2. **Catálogo (0:30):** en `/productos`, filtrar por Frutales y mostrar que la URL cambia. Abrir `/api/productos?perfil=intenso` para ver la API con el mismo filtro.
3. **Producto y carrito (0:30):** en Colombia Huila 250 g, elegir molienda Media y el pack de 2 bolsas (−10%). En el panel, mostrar el upsell y la barra de envío gratis.
4. **Checkout y pago (1:15):** enviar el formulario vacío para mostrar los errores por campo. Completar, pagar con Mercado Pago y la tarjeta APRO. Al volver al seguimiento, el estado pasa a **Pago confirmado** (lo hizo el webhook). En Supabase, el stock bajó 2.
5. **Admin (0:45):**
   - En la ventana 2, con un pedido por transferencia hecho antes, tocar **Confirmar pago**.
   - En Productos, cambiar un stock.
   - "Cada acción pasa por la API, que chequea el rol, y la base lo vuelve a chequear con RLS."

## 5. Base de datos (1:15)

Mostrar el diagrama del README, en la sección "Modelo de datos".

- **Organización:**
  - producto y variante separados (cada peso tiene precio y stock);
  - cafés y accesorios en una misma tabla, con `categoria`;
  - el pedido guarda una copia del precio y del nombre de cada línea.
- **Relaciones:** claves foráneas. Borrar un producto borra sus variantes. Una variante que ya se vendió no se puede borrar.
- **Consultas y ABM:**
  - `supabase-js` trae relaciones anidadas en un solo pedido;
  - las altas, bajas y modificaciones pasan por la API del admin;
  - pagar es una función SQL (`confirmar_pago`) en una transacción con bloqueo de fila: si se llama dos veces, no descuenta dos veces.
- **Validación en tres capas:** navegador, API (la misma función) y `CHECK` en la base (listas cerradas, rangos y largos máximos).
- **Permisos (RLS):**
  - cada cliente ve solo sus pedidos y solo el admin modifica el catálogo;
  - la clave secreta, que saltea RLS, se usa únicamente en el servidor.

## 6. Prompts: el mejor, el peor y cómo se corrigieron (1:30)

**El mejor: el cambio de idea** (bitácora #3).
- **Prompt:** cambiar la idea base a una tienda de café de especialidad y actualizar `CLAUDE.md`, la portada y la bitácora, *explicando antes qué archivos iba a tocar*.
- **Resultado:** propuso los 3 perfiles con 2 cafés cada uno y la molienda como opción y no como variante (18 combinaciones en lugar de 90), y sumó el test de café.
- **Por qué funcionó:** pedirle que explicara antes de tocar me dejó revisar el plan. Desde entonces es una regla fija en `CLAUDE.md`.

**El peor: el hero.**
- **Primer pedido:** un "hero interactivo con un video del proceso". Salió un video que se reproducía solo, en un recuadro y con tomas equivocadas (la molienda salía de la cafetera).
- **Segundo pedido** (textual): *"El Hero sigue siendo un video…, pero no es lo que te pedí. Yo necesito que al scrollear vaya avanzando la imagen. Que no sea un video en una cuadrícula. Que ocupe la mayor parte de la pantalla, o toda…"*
- **Diferencia:** describir el comportamiento esperado, y no el nombre del componente, cambió el resultado.
- **Ajuste final** con observaciones concretas: *"que no se vea tan zoomeado, que no pierda calidad, que el scroll no sea tan rápido"*.
- **Cómo se revisó:** con Playwright, midiendo que el cuadro del video avanzara con el scroll antes de commitear.

**El más corto que más hizo: la auditoría.**
- **Prompt:** *"security audit this codebase"*, con la skill de Cloudflare. La skill trae las instrucciones, así que el prompt puede ser corto.
- **Resultado:** 7 pistas.
- **Cómo se incorporó:** cada arreglo se aceptó con un test (unitario o E2E) y pasó por el CI antes de mergear.

**Cómo se revisó todo:** rama y PR por cambio, lint y tests en el CI, prueba en el navegador y la bitácora de errores en `PROMPTS.md`.

## 7. Dificultades, limitaciones y calidad (1:00)

**Dificultades:**
- El webhook no recibía avisos: la URL tenía solo el dominio. Se encontró mandando un POST a cada dirección posible.
- En el sandbox, la firma de Mercado Pago no coincide. Se documentó el modo sandbox: la seguridad la da consultar el pago.
- Supabase se pausaba por inactividad. Se resolvió con un workflow diario.

**Limitaciones:**
- el stock no se reserva al crear el pedido;
- en producción se usan credenciales de prueba de Mercado Pago;
- no hay email de confirmación ni recuperación de contraseña;
- la fecha de entrega no considera feriados.

**Calidad:**
- 70 tests unitarios y 51 E2E en el CI;
- una auditoría de seguridad con sus arreglos;
- un PR con checklist por cada cambio.

## Preguntas probables

**¿Server Component y Client Component?** El Server Component se ejecuta en el servidor y manda HTML: lo usan las páginas que leen la base. El de cliente (`"use client"`) corre en el navegador, con estado y eventos: el carrito, los filtros y los formularios.

**¿Por qué el precio no sale del carrito?** Porque el navegador se puede modificar. El carrito manda solo variante, molienda y cantidad, y `armarOrden` recalcula todo con la base (hay un test que manda un precio falso y verifica que se ignora).

**¿Qué es RLS?** *Row Level Security*: reglas en la base que deciden qué filas puede ver o cambiar cada usuario. Funcionan aunque alguien use la clave pública directo contra Supabase.

**¿Clave pública y clave secreta?** La pública va al navegador y la limita RLS. La secreta saltea RLS y solo se usa en el servidor: crear pedidos sin cuenta, el webhook y el seguimiento. No empieza con `NEXT_PUBLIC_`, así que nunca llega al navegador.

**¿Cómo sabés que el aviso del webhook es real?** Por la firma HMAC (`x-signature`) y, sobre todo, porque el servidor le pide el pago a Mercado Pago con nuestro token y solo confirma si está aprobado, es de ese pedido y el monto coincide.

**¿Y si el aviso llega dos veces?** `confirmar_pago` bloquea la fila y solo actúa si el pedido está pendiente o rechazado. La segunda vez no hace nada.

**¿Por qué el stock baja al pagar y no al crear el pedido?** Para que un pedido abandonado no bloquee stock. El costo es una posible sobreventa simultánea; está documentada como limitación.

**¿Por qué la molienda no es una variante?** No cambia el precio ni el stock, y como variante serían 90 combinaciones en lugar de 18.

**¿Cómo se actualiza la tienda si cambia la base?** Las páginas se regeneran cada 5 minutos (`revalidate = 300`), y al instante con cada cambio del admin (`revalidatePath`). `/productos` se arma en cada visita porque depende de los filtros.

**¿Qué prueban los tests?** Los unitarios prueban la lógica pura: carrito, órdenes, firma del webhook, filtros y validaciones. Los E2E prueban la tienda en un Chrome real (compra, cuenta, admin, API y webhook) contra una base de prueba que se prepara y se limpia sola.

**¿Qué encontró la auditoría y por qué nada quedó "confirmado"?** Se hizo solo revisando el código, sin ejecutarlo, porque no había un entorno aislado, y la skill solo confirma lo que ve funcionar. Dejó 7 pistas, todas arregladas con su test. Las principales: login CSRF, una redirección con un tab escondido, un regex de email que se podía trabar y campos sin largo máximo.

**¿Por qué se puede comprar sin cuenta?** Para que comprar tenga menos pasos. El código de seguimiento (`OC-` y 10 caracteres al azar) reemplaza a la cuenta para ver el pedido.
