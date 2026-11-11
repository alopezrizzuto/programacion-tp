# Guion de la exposición: Origen Café (10 minutos)

Sigue la consigna de la exposición oral y las diapositivas, una por una. Cada diapositiva tiene las mismas notas en el modo presentación. Al final están las 12 preguntas más probables. Los conceptos que se nombran están explicados en [conceptos.md](conceptos.md), y el detalle técnico, en el [README](../README.md).

| Tiempo | Diapositivas | Qué pide la consigna |
|---|---|---|
| 0:00 – 1:15 | 1 a 3: tapa, qué es, solución inicial y final | Funcionalidades distintivas, decisiones y alternativas; solución inicial frente a final |
| 1:15 – 2:15 | 4 y 5: tecnologías, IA | Para qué, por qué y cómo se integra cada una; cómo se revisó lo que hizo la IA |
| 2:15 – 3:05 | 6 y 7: arquitectura, recorrido de una compra | Arquitectura y recorrido de los datos |
| 3:05 – 6:05 | 8: demo en vivo | Funcionalidades principales |
| 6:05 – 7:05 | 9 y 10: base de datos | Estructura, relaciones, consultas, CRUD, validación y permisos |
| 7:05 – 9:00 | 11 a 14: peor prompt, mejor prompt, firma (extra), auditoría | Prompts reales, su respuesta y cómo se revisó |
| 9:00 – 10:00 | 15 a 17: dificultades, limitaciones, gracias | Dificultades, soluciones y limitaciones |

Si vas atrasado, salteá la 13 (la firma).

## Antes de empezar

- [ ] **Ventana 1, incógnito:** https://programacion-tp-black.vercel.app, sin sesión (cliente).
- [ ] **Ventana 2:** la misma tienda, logueado como **admin**, con dos pestañas:
  - `/admin/productos`, con el stock de **Colombia Huila 250 g** anotado;
  - `/admin/pedidos`, con un pedido por **transferencia** ya creado para confirmarlo en vivo.
- [ ] **Datos a mano:**
  - usuario y contraseña del **comprador de prueba** de Mercado Pago. Hay que ingresar con él: como invitado, Mercado Pago rechaza el pago;
  - tarjeta `5031 7557 3453 0604`, `11/30`, código `123`, DNI `12345678`;
  - titular `APRO`.
- [ ] **Plan B:** si Mercado Pago tarda o falla, pagar por **transferencia** y confirmar desde el admin. Usa la misma función `confirmar_pago` que el webhook.
- [ ] **Reloj a la vista:** la demo va de 3:05 a 6:05, sin pasarse.

## Diapositiva por diapositiva

**1 · Tapa** (0:00 – 0:10)
- "Soy Agustín López Rizzuto y les presento Origen Café: una tienda online de café de especialidad, hecha con Next.js, Supabase y Mercado Pago, y publicada en Vercel."

**2 · Qué es Origen Café** (0:10 – 0:45)
- "Vende 6 cafés en tres tamaños de bolsa, más accesorios. La molienda se elige al comprar. Se compra sin cuenta, solo con el email, con Mercado Pago o transferencia con 10% de descuento."
- Lo distintivo, una frase por tarjeta:
  - el test que recomienda café y molienda;
  - el hero donde el video avanza con el scroll;
  - los packs con descuento;
  - el código para seguir el pedido.
- Señalar el celular: "Y es responsive: esta es la misma portada en el celular."

**3 · De la solución inicial a la final** (0:45 – 1:15, solo tres filas)
- **Molienda:** "La alternativa era hacerla variante, pero serían 90 combinaciones con stock propio. Como opción del pedido son 18 variantes."
- **Test:** "Empezó calculándose en el navegador y pasó a una API, para validar en el servidor."
- **Compra:** "Al principio solo Mercado Pago; al final, sin cuenta, con código de seguimiento y también transferencia."

**4 · Tecnologías** (1:15 – 1:50, no leer fila por fila)
- **Next.js:** "Páginas y API en un solo proyecto. Las páginas leen la base en el servidor, sin exponer claves."
- **Supabase:** "La consigna pedía SQL directo. Es Postgres, con login, fotos y permisos dentro de la base."
- **Mercado Pago Checkout Pro:** "La tarjeta nunca pasa por mi tienda. Lo integré con fetch, sin SDK: son dos pedidos HTTP."
- **Vercel y GitHub Actions:** "Deploy automático y una preview por cada PR."

**5 · Herramientas de IA** (1:50 – 2:15)
- "claude.ai para planificar; Claude Code como agente en el repo, con reglas en `CLAUDE.md`; Higgsfield para las fotos y el video; y la skill de Cloudflare para la seguridad."
- **Cómo revisé lo que hizo la IA** (lo pide la consigna): "Primero el plan y mi OK; después una rama y un PR, el CI en verde y la prueba en el navegador. Nada entró sin eso."

**6 · Arquitectura** (2:15 – 2:45)
- "El navegador nunca escribe directo en la base: todo pasa por mi API, que vuelve a validar."
- "Las páginas leen el catálogo en el servidor, con la clave pública limitada por RLS."
- Flecha punteada: "Mercado Pago avisa a mi webhook cuando cambia un pago."

**7 · Recorrido de una compra** (2:45 – 3:05, remarcar dos pasos)
- **Paso 3:** "El precio sale de la base, nunca del navegador."
- **Paso 6:** "No le creo al aviso: verifico la firma y le pregunto el pago a Mercado Pago. Recién ahí confirmo y descuento el stock."
- Transición: "Ahora lo muestro en vivo."

**8 · Demo en vivo** (3:05 – 6:05)
1. **Portada (20 s):** bajar por el hero.
2. **Test (25 s):**
   - tocar "Ver mi café" sin responder: "Valida y dice qué falta";
   - responder Fuerte, Poco, Con leche y Espresso: "Lo calcula el servidor: el formulario consulta la API con fetch."
3. **Catálogo (25 s):**
   - en `/productos`, filtrar Frutales: "Los filtros quedan en la URL";
   - abrir `/api/productos?perfil=intenso`: "La misma búsqueda, en la API, en JSON."
4. **Carrito y pago (80 s):**
   - Colombia Huila 250 g, molienda Media, pack de 2 (−10%);
   - "Finalizar compra" con el formulario vacío, para mostrar los errores por campo;
   - completar, elegir Mercado Pago, **ingresar con el comprador de prueba** y pagar con la tarjeta APRO;
   - al volver aparece "Pago confirmado": "Lo confirmó el webhook."
5. **Admin (30 s, ventana 2):**
   - recargar `/admin/productos`: "El stock de Colombia Huila 250 g bajó 2";
   - en Pedidos, confirmar la transferencia preparada;
   - cambiar un stock.

**9 · Base de datos: tablas y relaciones** (6:05 – 6:35)
- "Producto y variante van separados: cada peso tiene su precio y su stock. Cafés y accesorios comparten tabla, con `categoria`."
- "El ítem del pedido guarda una copia del precio, para que el historial no cambie si mañana cambia el precio."
- Flecha punteada: "Un pedido puede no tener usuario, porque se compra sin cuenta."

**10 · Operaciones, validación y permisos** (6:35 – 7:05)
- **CRUD:** "El admin da de alta, edita y borra productos y variantes por la API; lo vieron en la demo."
- **Validación:** "Se valida tres veces, porque el navegador se puede modificar: en el navegador, en la API con la misma función y en la base con `CHECK`."
- **`confirmar_pago`:** "Si Mercado Pago avisa dos veces, la segunda no hace nada."
- **RLS:** "Son reglas dentro de Postgres. Funcionan aunque alguien use la clave pública directo contra Supabase."

**11 · Peor prompt: el hero** (7:05 – 7:40)
- **Qué pasaba:** "Pedí 'un hero interactivo con video' y tres veces salió un video en un recuadro."
- **Por qué fue el peor:** "Describía la cosa, no el comportamiento."
- **La causa escondida:** "Tenía apagados los efectos de animación de Windows. Eso activa 'reducir movimiento' en el navegador, y yo veía la versión alternativa, la del recuadro."
- **Qué cambió:** "Cuando escribí 'que al scrollear avance la imagen y ocupe toda la pantalla', salió bien."
- **Cómo se revisó:** "Con Playwright y en el navegador, antes de cada commit."

**12 · Mejor prompt: el webhook que respondía 405** (7:40 – 8:10)
- **Qué pasaba:** "Mercado Pago no lograba avisarme los pagos."
- **Por qué fue el mejor:** "En vez de describirlo, pegué la respuesta exacta del error: 405. Yo sospechaba de las cuentas de prueba."
- **La causa:** "La URL del webhook tenía solo el dominio: el aviso le pegaba a la portada, que no acepta POST."
- **Aprendizaje:** "El error textual vale más que mi interpretación."

**13 · El webhook, segunda parte: la firma** (8:10 – 8:30, **extra**: saltear si vas atrasado)
- "Con la URL corregida, los avisos llegaban, pero la firma nunca coincidía. Puse un log temporal y se lo pasé a Claude."
- **La causa:** "En el sandbox, el pago lo firma la cuenta vendedor de prueba, con una clave que no tengo."
- **La solución no apaga la seguridad:** "Le pregunto el pago a Mercado Pago con mi token y verifico estado, pedido y monto. Con credenciales reales, la firma se exige."

**14 · Auditoría de seguridad: login CSRF** (8:30 – 9:00)
- "Cuatro palabras alcanzaron porque la skill trae el método. Lanzó 40 agentes: ninguna vulnerabilidad confirmada y 7 pistas, todas arregladas con su test."
- **La más importante:** "Otra página podía mandar un formulario oculto a mi login y dejarte logueado en la cuenta del atacante."
- **El arreglo:** "Ahora rechazo los pedidos de otro sitio (403) y los que no son JSON (415)."

**15 · Otras dificultades** (9:00 – 9:20, contar dos)
- **Supabase:** "En el plan gratis se pausa a los 7 días sin uso, y se cayó la tienda. Lo resolví con una consulta diaria desde GitHub Actions."
- **Tests E2E:** "No podían escribir en la base real. Usan un proyecto de Supabase aparte, que se prepara y se limpia solo."

**16 · Limitaciones y calidad** (9:20 – 9:45)
- "Son decisiones de alcance. El stock no se reserva al crear el pedido, para que uno abandonado no bloquee bolsas; a cambio, puede haber una sobreventa."
- "Todo pasó por PR con checklist, CI y preview: más de 25 PRs, 70 tests unitarios y 51 de punta a punta."

**17 · Gracias** (9:45 – 10:00)
- "Gracias. ¿Preguntas?"

## Las 12 preguntas más probables

**1. ¿Qué es un Server Component y qué uno de cliente?** El Server Component se ejecuta en el servidor, puede leer la base y manda el HTML listo: así son las páginas del catálogo. El de cliente (`"use client"`) corre en el navegador, con estado y clicks: el carrito, los filtros, los formularios y el hero.

**2. ¿Qué pasa si alguien cambia el precio en el navegador?** Nada. El carrito guarda solo variante, molienda y cantidad. Al crear el pedido, el servidor busca los precios en la base y recalcula todo. Hay un test que manda un precio falso y verifica que se ignora.

**3. ¿Qué es RLS?** *Row Level Security*: reglas dentro de Postgres que deciden qué filas puede ver o cambiar cada usuario. Por ejemplo, "cada cliente ve solo sus pedidos" y "solo el admin modifica productos". Funcionan aunque alguien use la clave pública directo contra Supabase.

**4. ¿Clave pública y clave secreta?** La pública va al navegador y la limita RLS. La secreta saltea RLS y solo vive en el servidor: crea los pedidos sin cuenta y la usan el webhook y el seguimiento. No empieza con `NEXT_PUBLIC_`, así que nunca llega al navegador.

**5. ¿Cómo sabés que el aviso del webhook es real?** Por la firma HMAC y, sobre todo, porque le pregunto el pago a Mercado Pago con mi token. Confirmo solo si está aprobado, es de ese pedido y el monto coincide. Un aviso inventado no tiene un pago real detrás.

**6. ¿Y si Mercado Pago avisa dos veces?** `confirmar_pago` bloquea la fila del pedido y solo actúa si está pendiente o rechazado. La segunda vez no hace nada: es idempotente, así que el stock no baja dos veces.

**7. ¿Por qué el stock baja al pagar y no al crear el pedido?** Para que un pedido abandonado no bloquee bolsas. El costo es una posible sobreventa si dos personas pagan la última bolsa a la vez; la base no deja que el stock quede negativo. Con más tiempo, reservaría el stock por unos minutos.

**8. ¿Por qué la molienda no es una variante?** No cambia el precio ni el stock: el grano es el mismo. Como variante serían 90 combinaciones (6 cafés × 3 pesos × 5 moliendas) en lugar de 18.

**9. ¿Por qué se valida tres veces?** En el navegador, por comodidad: avisa rápido. En la API, por seguridad, porque el navegador se puede modificar. En la base, con `CHECK`, como última red si alguien saltea la API.

**10. ¿Qué es CSRF y cómo lo frenaste?** Otro sitio hace que tu navegador mande un pedido a mi tienda sin que te des cuenta. Rechazo los pedidos que vienen de otro origen (403) y los que no son JSON (415), porque un formulario HTML común no puede mandar JSON.

**11. ¿Qué es CI/CD y qué prueban los tests?** CI: en cada PR, GitHub Actions corre lint, 70 tests unitarios, el build y 51 E2E. CD: Vercel publica `main` solo y arma una preview por PR. Los unitarios prueban funciones sueltas (carrito, pedido, firma, filtros). Los E2E abren un Chrome real y compran como una persona, contra una base de prueba.

**12. ¿Qué hiciste vos y qué hizo la IA?** La IA escribió la mayor parte del código. Yo:
- definí qué se hacía y en qué orden, y aprobé cada plan;
- probé todo en el navegador;
- diagnostiqué con datos reales: el error 405 y los logs del webhook;
- tomé las decisiones de compromiso, como no reservar stock o el modo sandbox.

Nada entró sin PR, CI en verde y prueba manual.
