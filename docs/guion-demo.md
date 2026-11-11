# Guion de la exposición: Origen Café (10 minutos)

Sigue la consigna de la exposición oral y las diapositivas, una por una. Cada diapositiva tiene las mismas notas en el modo presentación. Al final están las respuestas cortas a las preguntas técnicas más probables. El detalle de cada tema está en el [README](../README.md).

| Tiempo | Diapositivas | Qué pide la consigna |
|---|---|---|
| 0:00 – 0:45 | 1 a 4: tapa, agenda, qué es, solución inicial y final | Funcionalidades distintivas; solución inicial frente a final |
| 0:45 – 2:00 | 5 y 6: tecnologías, IA | Para qué, por qué y cómo se integra cada una |
| 2:00 – 3:00 | 7 y 8: arquitectura, recorrido de una compra | Arquitectura y recorrido de los datos |
| 3:00 – 6:00 | 9: demo en vivo | Funcionalidades principales |
| 6:00 – 7:00 | 10 y 11: base de datos | Estructura, relaciones, consultas, ABM, validación y permisos |
| 7:00 – 9:15 | 12 a 15: problemas (prompt textual y código anterior y actual) | Prompts reales, qué cambió al modificarlos y cómo se revisó |
| 9:15 – 10:00 | 16 a 18: dificultades, limitaciones, gracias | Dificultades, soluciones y limitaciones |

## Antes de empezar

- [ ] **Ventana 1, incógnito:** https://programacion-tp-black.vercel.app, sin sesión (cliente).
- [ ] **Ventana 2:** la misma demo, logueado como **admin** y abierta en `/admin/pedidos?filtro=pago`, con un pedido por **transferencia** ya creado para confirmarlo en vivo.
- [ ] **Datos a mano:**
  - usuario y contraseña del **comprador de prueba** de Mercado Pago. Hay que ingresar con él: como invitado, Mercado Pago rechaza el pago;
  - tarjeta `5031 7557 3453 0604`, `11/30`, código `123`, DNI `12345678`;
  - titular `APRO`.
- [ ] **Pestaña de Supabase** (Table Editor, `variantes`), con el stock de **Colombia Huila 250 g** anotado.
- [ ] **Plan B:** si Mercado Pago tarda o falla, pagar por **transferencia** y confirmar desde el admin. Usa la misma función `confirmar_pago` que el webhook.
- [ ] **Reloj a la vista:** la demo va de 3:00 a 6:00, sin pasarse.

## Diapositiva por diapositiva

**1 · Tapa**
- "Soy Agustín López Rizzuto y les presento Origen Café: una tienda online de café de especialidad, hecha con Next.js, Supabase y Mercado Pago, y publicada en Vercel."

**2 · Agenda** (5 segundos, no leerla)
- "Primero qué es y qué tecnologías usé, después la arquitectura y la demo, la base de datos, y cierro con los problemas que tuve y cómo los resolví con IA."

**3 · Qué es Origen Café**
- "Vende 6 cafés en 3 pesos; la molienda se elige al comprar. Se compra sin cuenta, con Mercado Pago o transferencia."
- Lo distintivo, una frase por tarjeta:
  - el test que recomienda café y molienda;
  - el hero que avanza con el scroll;
  - los packs con descuento;
  - el seguimiento con un código.

**4 · De la solución inicial a la final** (elegir 2 o 3 filas)
- **Molienda:** "Si fuera variante, serían 90 combinaciones con stock propio; como opción del pedido son 18."
- **Test:** "Pasó del navegador a una API, para validar en el servidor."
- **Tests:** "Al final sumé 70 tests unitarios y 51 E2E al CI."

**5 · Tecnologías** (destacar tres)
- **Next.js:** "Páginas y API en un solo proyecto; los Server Components leen la base sin exponer claves."
- **Supabase:** "La consigna pide SQL directo, y trae Auth, Storage y permisos en la base (RLS)."
- **Mercado Pago Checkout Pro:** "La tarjeta nunca pasa por mi tienda. Lo integré con fetch, sin SDK: son dos pedidos HTTP."

**6 · Herramientas de IA**
- **claude.ai** para evaluar la idea y planificar.
- **Claude Code** como agente en el repo, con las reglas en `CLAUDE.md`: explicar antes de cambiar, una rama y un PR por tarea, probar antes de commitear.
- **Higgsfield** para las fotos y el video del hero.
- **La skill de Cloudflare** para la auditoría.
- Remate: "Nada entró sin PR, CI y prueba en el navegador."

**7 · Arquitectura**
- "El navegador nunca escribe directo en la base: todo pasa por la API, que vuelve a validar. Las páginas leen el catálogo en el servidor, con la clave pública limitada por RLS. Mercado Pago avisa al webhook cuando cambia un pago."

**8 · Recorrido de una compra** (remarcar dos pasos)
- **Paso 3:** "El precio sale de la base, nunca del navegador."
- **Paso 6:** "No le creo al aviso: verifico la firma y le pregunto el pago a Mercado Pago. Recién ahí confirmo y descuento el stock."
- Transición: "Ahora lo muestro en vivo."

**9 · Demo en vivo** (3 minutos)
1. **Portada (20 s):** bajar por el hero. En el test, elegir Fuerte, Poco, Con leche y Espresso y tocar "Ver mi café": "La recomendación la calcula el servidor."
2. **Catálogo (20 s):** en `/productos`, filtrar Frutales: "Los filtros quedan en la URL." Abrir `/api/productos?perfil=intenso`: "La misma búsqueda, en la API."
3. **Carrito (20 s):** Colombia Huila 250 g, molienda Media, pack de 2 (−10%). Mostrar el upsell y la barra de envío gratis.
4. **Pago (90 s):**
   - "Finalizar compra" con el formulario vacío, para mostrar los errores por campo;
   - completar, elegir Mercado Pago, **ingresar con el comprador de prueba** y pagar con la tarjeta APRO;
   - al volver aparece "Pago confirmado": "Lo confirmó el webhook y bajó el stock."
5. **Admin (30 s):** confirmar la transferencia hecha antes y cambiar un stock.

**10 · Base de datos: tablas y relaciones**
- "Producto y variante separados: cada peso tiene su precio y su stock. Cafés y accesorios comparten tabla, con una columna `categoria`."
- "El pedido guarda una copia del precio: si mañana cambia, el pedido viejo sigue diciendo lo que se cobró."
- Flecha punteada: "Un pedido puede no tener usuario, porque se compra sin cuenta."

**11 · Operaciones, validación y permisos**
- **Validación:** "Se valida tres veces, porque el navegador se puede modificar: en el navegador, en la API con la misma función y en la base con `CHECK`."
- **`confirmar_pago`:** "Si Mercado Pago avisa dos veces, la segunda no hace nada."
- **RLS:** "Son reglas dentro de Postgres. Funcionan aunque alguien use la clave pública directo contra Supabase."

**12 · Problema 1: el webhook que respondía 405** (30 s)
- **Qué pasaba:** "Mercado Pago no lograba avisarme los pagos."
- **Qué le pedí a Claude:** "Le pegué la respuesta exacta del error. Yo sospechaba de las cuentas de prueba."
- **La causa:** "La URL tenía solo el dominio: el aviso le pegaba a la portada, que no acepta POST."
- **Aprendizaje:** "Pegar el error exacto sirve más que describirlo."

**13 · Problema 2: la firma que nunca coincidía** (30 s)
- **Qué hicimos:** "Primero, un log temporal para ver qué llegaba. Se lo pasé a Claude."
- **La causa:** "En el sandbox, el pago lo firma la cuenta vendedor de prueba, con una clave que no tengo."
- **La solución no apaga la seguridad:** "Le pregunto el pago a Mercado Pago con mi token y solo confirmo si está aprobado y el monto es exacto. Con credenciales reales, la firma se exige."

**14 · Problema 3: el hero** (el "peor prompt"; 40 s)
- **Qué pasaba:** "Pedí un hero interactivo con un video, y tres veces salió otra cosa: un video en un recuadro."
- **La causa escondida:** "Tenía apagados los efectos de animación de Windows. Eso activa 'reducir movimiento' en el navegador, y yo veía la versión alternativa."
- **Qué cambió:** "Cuando describí el comportamiento, salió bien."
- **Cómo se revisó:** "Cada versión la verifiqué con Playwright antes de commitear."

**15 · Problema 4: login CSRF** (40 s)
- "Con un prompt de cuatro palabras, la skill de Cloudflare revisó todo con 40 agentes: ninguna vulnerabilidad confirmada y 7 pistas."
- **La más importante:** "Otra página podía mandar un formulario oculto a mi login y dejarte logueado en la cuenta del atacante."
- **El arreglo:** "Ahora rechazo los pedidos de otro sitio y los que no son JSON. Cada arreglo tiene su test."

**16 · Otras dificultades** (contar dos)
- **Supabase:** "En el plan gratis se pausa a los 7 días sin uso. Lo resolví con una consulta diaria desde GitHub Actions."
- **Tests E2E:** "Usan un proyecto de Supabase aparte, que se prepara y se limpia solo."

**17 · Limitaciones y calidad**
- "Son decisiones de alcance. Por ejemplo, el stock no se reserva para que un pedido abandonado no bloquee bolsas; a cambio, puede haber una sobreventa."
- "Todo pasó por PR, CI y tests: 70 unitarios y 51 de punta a punta."

**18 · Gracias**
- "Gracias. ¿Preguntas?"

## Preguntas probables

**¿Qué es un Server Component y qué uno de cliente?** El Server Component se ejecuta en el servidor y manda HTML: lo usan las páginas que leen la base. El de cliente (`"use client"`) corre en el navegador, con estado y eventos: el carrito, los filtros y los formularios.

**¿Por qué el precio no sale del carrito?** Porque el navegador se puede modificar. El carrito manda solo variante, molienda y cantidad, y `armarOrden` recalcula todo con la base. Hay un test que manda un precio falso y verifica que se ignora.

**¿Qué es RLS?** *Row Level Security*: reglas en la base que deciden qué filas puede ver o cambiar cada usuario. Funcionan aunque alguien use la clave pública directo contra Supabase.

**¿Clave pública y clave secreta?** La pública va al navegador y la limita RLS. La secreta saltea RLS y solo se usa en el servidor: para crear pedidos sin cuenta, en el webhook y en el seguimiento. No empieza con `NEXT_PUBLIC_`, así que nunca llega al navegador.

**¿Cómo sabés que el aviso del webhook es real?** Por la firma HMAC (`x-signature`) y, sobre todo, porque el servidor le pide el pago a Mercado Pago con nuestro token y solo confirma si está aprobado, es de ese pedido y el monto coincide.

**¿Y si el aviso llega dos veces?** `confirmar_pago` bloquea la fila y solo actúa si el pedido está pendiente o rechazado. La segunda vez no hace nada.

**¿Por qué hay que ingresar con un comprador de prueba en Mercado Pago?** Con credenciales de prueba, Mercado Pago exige que el comprador también sea de prueba. Como invitado responde "Una de las partes con la que intentás hacer el pago es de prueba".

**¿Por qué el stock baja al pagar y no al crear el pedido?** Para que un pedido abandonado no bloquee stock. El costo es una posible sobreventa simultánea, documentada como limitación.

**¿Por qué la molienda no es una variante?** No cambia el precio ni el stock, y como variante serían 90 combinaciones en lugar de 18.

**¿Cómo se actualiza la tienda si cambia la base?** Las páginas se regeneran cada 5 minutos (`revalidate = 300`), y al instante con cada cambio del admin (`revalidatePath`). `/productos` se arma en cada visita porque depende de los filtros.

**¿Qué prueban los tests?** Los unitarios prueban la lógica pura: carrito, órdenes, firma del webhook, filtros y validaciones. Los E2E prueban la tienda en un Chrome real (compra, cuenta, admin, API y webhook) contra una base de prueba que se prepara y se limpia sola.

**¿Por qué la auditoría no confirmó nada?** Porque se hizo solo revisando el código: no había un entorno aislado para ejecutarlo, y la skill solo confirma lo que ve funcionar. Las 7 pistas se arreglaron igual, cada una con su test.
