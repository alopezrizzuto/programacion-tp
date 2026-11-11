# Guion de la exposición: Origen Café (10 minutos)

Sigue la consigna de la exposición oral y las diapositivas, una por una; cada diapositiva tiene las mismas notas en el modo presentación. Cada término técnico que se nombra se define en voz alta en la misma frase (en **negrita**). Al final están las preguntas probables sobre lo que no se nombra.

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

## Las palabras que definís en voz alta

Son las únicas que hay que saber explicar de memoria. Cada una se dice una vez, con su definición.

| Palabra | Lo que decís |
|---|---|
| Hero | La primera pantalla de la página. |
| Responsive | Se adapta al tamaño de la pantalla. |
| Variante | Cada tamaño de bolsa, con su propio precio y stock. |
| API | Las direcciones `/api` que reciben pedidos del navegador y responden con datos. |
| SQL directo | SQL es el lenguaje de las bases de datos; "directo" es que las tablas las escribo yo, en archivos. |
| Agente (Claude Code) | Una IA que trabaja dentro del proyecto: edita archivos y corre comandos. |
| `CLAUDE.md` | El archivo con las reglas que el agente lee al empezar. |
| Skill | Un paquete de instrucciones listas para una tarea. |
| PR | Una propuesta de cambio que se revisa antes de sumarla. |
| fetch | Pedirle datos al servidor sin recargar la página. |
| Webhook | Una dirección mía a la que Mercado Pago avisa cuando cambia un pago. |
| Firma | Un código que solo Mercado Pago y yo podemos calcular: si coincide, el aviso es auténtico. |
| JSON | El formato de datos de la web. |
| 1 a N | Uno a muchos: un producto tiene muchas variantes. |
| Migraciones y seed | Los archivos `.sql` que crean las tablas, y el que carga los datos iniciales. |
| CRUD | Alta, lectura, modificación y baja. |
| Transacción | O pasan todas las operaciones juntas, o ninguna. |
| CHECK | Reglas que la base revisa antes de guardar. |
| RLS | Reglas dentro de la base que deciden quién puede ver o cambiar cada fila. |
| Reducir movimiento | Una opción para personas a las que las animaciones les molestan. |
| Playwright | Abre un navegador real y lo usa como una persona, para probar. |
| 405 / 401 | "Esta dirección no acepta este tipo de pedido" / "no autorizado". |
| CSRF | Otra página usa tu navegador para mandarle un pedido a mi tienda. |
| Tests unitarios y de compras completas | Los unitarios prueban funciones sueltas; los otros abren un navegador y simulan una compra. |
| CI/CD | En cada PR, GitHub corre solo los tests, y Vercel publica una copia para probarla. |

## Antes de empezar

- [ ] **Ventana 1, incógnito:** https://programacion-tp-black.vercel.app, sin sesión (cliente).
- [ ] **Ventana 2:** la misma tienda, logueado como **admin**, con dos pestañas:
  - `/admin/productos`, con el stock de **Colombia Huila 250 g** anotado;
  - `/admin/pedidos`, con un pedido por **transferencia** ya creado para confirmarlo en vivo.
- [ ] **Datos a mano:**
  - usuario y contraseña del **comprador de prueba** de Mercado Pago. Hay que ingresar con él: como invitado, Mercado Pago rechaza el pago;
  - tarjeta `5031 7557 3453 0604`, `11/30`, código `123`, DNI `12345678`;
  - titular `APRO`.
- [ ] **Plan B:** si Mercado Pago tarda o falla, pagar por **transferencia** y confirmar desde el admin. Hace lo mismo que el aviso de Mercado Pago.
- [ ] **Reloj a la vista:** la demo va de 3:05 a 6:05, sin pasarse.

## Diapositiva por diapositiva

**1 · Tapa** (0:00 – 0:10)
- "Soy Agustín López Rizzuto y les presento Origen Café: una tienda online de café de especialidad, hecha con Next.js, Supabase y Mercado Pago, y publicada en Vercel."

**2 · Qué es Origen Café** (0:10 – 0:45)
- "Vende 6 cafés en tres tamaños de bolsa, más accesorios. La molienda se elige al comprar. Se compra sin cuenta, solo con el email, con Mercado Pago o transferencia con 10% de descuento."
- Lo distintivo, una frase por tarjeta:
  - "el test que recomienda café y molienda;"
  - "el **hero, que es la primera pantalla**, donde el video avanza con el scroll;"
  - "los packs con descuento;"
  - "y un código para seguir el pedido."
- Señalar el celular: "Y es **responsive, o sea que se adapta al tamaño de la pantalla**: esta es la misma portada en el celular."

**3 · De la solución inicial a la final** (0:45 – 1:15, solo tres filas)
- **Molienda:** "Una **variante es cada tamaño de bolsa, con su precio y su stock**. La alternativa era que la molienda también fuera variante, pero serían 90 combinaciones con stock propio. Como opción del pedido son 18 variantes."
- **Test:** "Empezó calculándose en el navegador y pasó al servidor, que es donde no se puede modificar."
- **Compra:** "Al principio solo Mercado Pago; al final, sin cuenta, con código de seguimiento y también transferencia."

**4 · Tecnologías** (1:15 – 1:50, no leer fila por fila)
- **Next.js:** "Páginas y API en un solo proyecto. La **API son las direcciones `/api` que reciben pedidos del navegador y responden con datos**. Las páginas se arman en el servidor, así las claves nunca llegan al navegador."
- **Supabase:** "La consigna pedía **SQL directo: SQL es el lenguaje de las bases de datos, y 'directo' quiere decir que las tablas las escribo yo, en archivos**. Supabase es una base Postgres con login, fotos y permisos incluidos."
- **Mercado Pago Checkout Pro:** "La persona paga en la página de Mercado Pago, así que la tarjeta nunca pasa por mi tienda."
- **Vercel y GitHub Actions:** "Vercel publica la tienda sola; GitHub Actions corre los controles automáticos en cada cambio."

**5 · Herramientas de IA** (1:50 – 2:15)
- "claude.ai para planificar. Claude Code es un **agente: una IA que trabaja dentro del proyecto, edita archivos y corre comandos**. Sus reglas están en un archivo, **`CLAUDE.md`, que lee al empezar**."
- "Higgsfield para las fotos y el video. Y una **skill** de Cloudflare, que es **un paquete de instrucciones listas** para auditar la seguridad."
- **Cómo revisé** (lo pide la consigna): "Primero el plan y mi OK. Después cada cambio en una rama y un **PR, o sea una propuesta que se revisa antes de sumarla**; los tests automáticos en verde, y la prueba en el navegador."

**6 · Arquitectura** (2:15 – 2:45)
- "El navegador nunca escribe directo en la base: todo pasa por la API, que vuelve a validar. El navegador le habla con **fetch, que es pedirle datos al servidor sin recargar la página**."
- "Las páginas leen el catálogo en el servidor con la clave pública, que está limitada por permisos dentro de la base."
- Flecha punteada: "Y el **webhook es una dirección mía a la que Mercado Pago me avisa cuando cambia un pago**."

**7 · Recorrido de una compra** (2:45 – 3:05, remarcar dos pasos)
- **Paso 3:** "El precio sale de la base, nunca del navegador. Aunque alguien cambie un precio en su navegador, se cobra el real."
- **Paso 6:** "No le creo al aviso así nomás: verifico la **firma, que es un código que solo Mercado Pago y yo podemos calcular**, y además le pregunto el pago a Mercado Pago. Recién ahí confirmo y descuento el stock."
- Transición: "Ahora lo muestro en vivo."

**8 · Demo en vivo** (3:05 – 6:05)
1. **Portada (20 s):** bajar por el hero.
2. **Test (25 s):**
   - tocar "Ver mi café" sin responder: "Valida y dice qué falta";
   - responder Fuerte, Poco, Con leche y Espresso: "Lo calcula el servidor: el formulario le pregunta a la API con fetch, sin recargar la página."
3. **Catálogo (25 s):**
   - en `/productos`, filtrar Frutales: "Los filtros quedan en la dirección: se puede compartir el link";
   - abrir `/api/productos?perfil=intenso`: "La misma búsqueda en la API: devuelve los datos crudos, en **JSON, que es el formato de datos de la web**."
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
- "**1 a N quiere decir uno a muchos**: un producto tiene muchas variantes, y un pedido, muchos ítems."
- "Producto y variante separados: cada peso tiene su precio y su stock. Cafés y accesorios comparten tabla."
- "El ítem del pedido guarda una copia del precio, para que el historial no cambie si mañana cambia el precio."
- Flecha punteada: "Un pedido puede no tener usuario, porque se compra sin cuenta."
- Abajo: "Las tablas no se crean a mano en Supabase: están en **archivos `.sql` guardados en Git, las migraciones**. El **seed carga los datos iniciales**."

**10 · Operaciones, validación y permisos** (6:35 – 7:05)
- **CRUD:** "El admin hace el **CRUD completo, o sea alta, lectura, modificación y baja** de productos y variantes; lo vieron en la demo."
- **Confirmar el pago:** "Es una **transacción: o pasan las dos cosas, descontar stock y marcar pagado, o ninguna**. Si Mercado Pago avisa dos veces, la segunda no hace nada."
- **Validación:** "Se valida tres veces porque el navegador se puede modificar. La última es **CHECK: reglas que la base revisa antes de guardar**."
- **RLS:** "**RLS son reglas dentro de la base que deciden quién puede ver o cambiar cada fila**. Funcionan aunque alguien entre directo a Supabase con la clave pública."

**11 · Peor prompt: el hero** (7:05 – 7:40)
- **Qué pasaba:** "Pedí 'un hero interactivo con video' y tres veces salió un video en un recuadro."
- **Por qué fue el peor:** "Describía la cosa, no el comportamiento."
- **La causa escondida:** "Tenía apagados los efectos de animación de Windows. Eso activa '**reducir movimiento', una opción para personas a las que las animaciones les molestan**, y yo veía la versión alternativa, la del recuadro."
- **Qué cambió:** "Cuando escribí 'que al scrollear avance la imagen y ocupe toda la pantalla', salió bien."
- **El código:** "Antes, con reducir movimiento, mostraba un video común. Ahora el video siempre se acerca de a poco al punto del scroll."
- **Cómo se revisó:** "Con **Playwright, que abre un navegador real y lo usa como una persona**, y probándolo yo."

**12 · Mejor prompt: el webhook que respondía 405** (7:40 – 8:10)
- **Qué pasaba:** "Mercado Pago no lograba avisarme los pagos."
- **Por qué fue el mejor:** "En vez de describirlo, pegué la respuesta exacta del error. **405 quiere decir 'esta dirección no acepta este tipo de pedido'**. Yo sospechaba de las cuentas de prueba."
- **La causa:** "La dirección del webhook tenía solo el dominio: el aviso le llegaba a la portada, que no recibe avisos."
- **Aprendizaje:** "El error textual vale más que mi interpretación."

**13 · El webhook, segunda parte: la firma** (8:10 – 8:30, **extra**: saltear si vas atrasado)
- "Con la dirección corregida, los avisos llegaban, pero la firma nunca coincidía. Hice que el servidor anotara qué llegaba y se lo pasé a Claude."
- **La causa:** "En el modo prueba, el aviso lo firma la cuenta vendedora de prueba, con una clave que yo no tengo. Por eso el servidor lo rechazaba con **401, que es 'no autorizado'**."
- **El código:** "Antes, firma inválida era rechazo. Ahora, en modo prueba, sigue: busca el pago en Mercado Pago y decide según lo que responde."
- "No apagué la seguridad: verifico que el pago esté aprobado, que sea de ese pedido y que el monto sea exacto. Con cuentas reales, la firma se exige."

**14 · Auditoría: otra página podía loguearte en una cuenta ajena** (8:30 – 9:00)
- **El prompt:** "Cuatro palabras alcanzaron porque la skill ya trae el método. Encontró 7 pistas y las arreglé todas, cada una con su test."
- **La más importante:** "Otra página podía mandar un formulario oculto a mi login y dejarte logueado en la cuenta del atacante. Lo que compraras quedaba en su cuenta. Este ataque se llama **CSRF: otra página usa tu navegador para mandarle un pedido a mi tienda**."
- **El arreglo:** "Antes leía el pedido sin mirar de dónde venía. Ahora primero reviso que venga de mi propia página y en el formato que usa mi tienda; si no, lo rechazo."

**15 · Otras dificultades** (9:00 – 9:20, contar dos)
- **Supabase:** "En el plan gratis se pausa a los 7 días sin uso, y se cayó la tienda. Lo resolví con una tarea automática de GitHub que consulta la base todos los días."
- **Tests:** "Los tests que simulan compras crean pedidos y cuentas, así que no podían correr contra la base real. Usan un proyecto aparte, que se prepara y se limpia solo."

**16 · Limitaciones y calidad** (9:20 – 9:45)
- "Son decisiones de alcance. El stock no se reserva al crear el pedido, para que uno abandonado no bloquee bolsas; a cambio, puede haber una sobreventa."
- "Más de 25 PRs. En cada uno, GitHub corre solo los tests: **70 unitarios, que prueban funciones sueltas como el cálculo del carrito, y 51 que abren un navegador y simulan compras completas**. Y Vercel publica una copia del PR para probarlo antes de sumarlo. Eso es el **CI/CD** que pide la consigna."

**17 · Gracias** (9:45 – 10:00)
- "Gracias. ¿Preguntas?"

## Si te preguntan

Cosas que no se nombran, pero que pueden salir en las preguntas.

**1. ¿Cómo que "las páginas se arman en el servidor"?** En Next.js, las páginas son por defecto *Server Components*: se ejecutan en el servidor, leen la base y mandan el HTML listo. Las partes con clicks (carrito, filtros, formularios) son componentes de cliente y corren en el navegador.

**2. ¿Next.js y React no son lo mismo?** React arma la interfaz con componentes. Next.js es un framework sobre React que agrega las rutas (cada carpeta es una página), la API y armar las páginas en el servidor.

**3. ¿Dónde se guarda el carrito?** En el `localStorage` del navegador, un espacio que sobrevive al cerrar la pestaña. Se guarda solo qué variante, qué molienda y cuántas; nunca precios.

**4. ¿Qué es la clave pública y la secreta?** La pública va al navegador y la limitan los permisos (RLS). La secreta saltea esos permisos y solo vive en el servidor. La usa, por ejemplo, para crear pedidos de quien compra sin cuenta.

**5. ¿Qué pasa si Mercado Pago avisa dos veces el mismo pago?** La función que confirma el pago primero bloquea el pedido y mira su estado: si ya está pagado, no hace nada. Así el stock no baja dos veces.

**6. ¿Por qué el stock baja al pagar y no al crear el pedido?** Para que un pedido abandonado no bloquee bolsas. El costo es que, si dos personas pagan la última bolsa a la vez, puede haber sobreventa. La base no deja el stock en negativo.

**7. ¿Cómo se protege el panel admin?** En tres lugares: la página revisa que tu usuario sea admin, la API lo vuelve a revisar, y la base (RLS) solo deja modificar productos al admin.

**8. ¿Por qué la molienda no cambia el precio?** Porque el grano es el mismo: solo se muele distinto. Por eso no tiene stock propio.

**9. ¿Por qué se valida tres veces?** En el navegador, por comodidad (avisa rápido). En la API, por seguridad, porque el navegador se puede modificar. En la base, como última red.

**10. ¿Cómo funciona la recomendación? ¿Usa IA?** No usa IA, son reglas con puntaje: cada respuesta suma puntos a los cafés según su tostado, acidez y cuerpo. Se muestra el que más puntos tiene, con su porcentaje de coincidencia.

**11. ¿Por qué no usaste el SDK de Mercado Pago?** El SDK es la biblioteca oficial. No hizo falta: son solo dos pedidos (crear el cobro y consultar un pago), y con `fetch` se ve exactamente qué se manda.

**12. ¿Qué hiciste vos y qué hizo la IA?** La IA escribió la mayor parte del código. Yo:
- definí qué se hacía y en qué orden, y aprobé cada plan;
- probé todo en el navegador;
- encontré los problemas con datos reales: el error 405 y lo que llegaba al webhook;
- tomé las decisiones, como no reservar stock o cómo verificar los pagos en modo prueba.

Nada entró sin PR, tests en verde y prueba manual.
