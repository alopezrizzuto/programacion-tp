# Guion de la exposición: Origen Café (10 minutos)

Sigue la consigna de la exposición oral y las diapositivas, una por una; cada diapositiva tiene este mismo texto en sus notas. Cada término técnico se define en voz alta la primera vez que se nombra. Al final están las preguntas probables, también las que pueden salir durante la demo.

| Tiempo | Diapositivas | Qué pide la consigna |
|---|---|---|
| 0:00 – 1:25 | 1 a 3: tapa, qué es, de la primera versión a la final | Funcionalidades distintivas, decisiones, solución inicial frente a final |
| 1:25 – 3:00 | 4 y 5: tecnologías, herramientas de IA | Qué, para qué y por qué; cómo se revisó lo que hizo la IA |
| 3:00 – 4:20 | 6 y 7: arquitectura, recorrido de una compra | Arquitectura y recorrido de los datos |
| 4:20 – 6:25 | 8: demo en vivo | Funcionalidades principales |
| 6:25 – 7:30 | 9 y 10: base de datos | Estructura, relaciones, consultas, CRUD, validación y permisos |
| 7:30 – 9:20 | 11 a 13: peor prompt, mejor prompt, prompt con skill | Qué buscaba, prompt real, respuesta, qué cambió y cómo lo revisé |
| 9:20 – 10:00 | 14 y 15: dificultades y limitaciones, gracias | Dificultades, soluciones y limitaciones |

La diapositiva de la firma del webhook está **oculta** en la presentación: es de respaldo por si preguntan (ver "Si te preguntan").

## Las palabras que definís en voz alta

Son las únicas que hay que saber explicar de memoria.

| Palabra | Lo que decís |
|---|---|
| E-commerce | Una tienda online. |
| Responsive | Se adapta al tamaño de la pantalla. |
| Variante | Una versión del producto que se vende por separado, con su propio precio y stock. |
| Hero | La primera pantalla de la página. |
| Framework | Una base de herramientas para armar la aplicación (Next.js está hecho sobre React). |
| API | Las direcciones `/api` que reciben pedidos del navegador y responden con datos. |
| SQL | El lenguaje de las bases de datos. |
| Skill | Un paquete de instrucciones listas para una tarea. |
| fetch | Mandar y recibir datos del servidor sin recargar la página. |
| RLS | Reglas dentro de la base que deciden quién puede ver o cambiar cada fila. |
| Webhook | Una dirección de mi API a la que Mercado Pago avisa cuando cambia un pago. |
| Firma | Un código que solo Mercado Pago y yo podemos calcular: si coincide, el aviso es auténtico. |
| Migraciones y seed | Los archivos `.sql` que crean las tablas, y el que carga los datos iniciales. |
| CRUD | Alta, lectura, modificación y baja. |
| Transacción | O pasan todas las operaciones juntas, o ninguna. |
| CHECK | Reglas que la base revisa antes de guardar. |
| Reducir movimiento | Una opción para personas a las que las animaciones les molestan. |
| Playwright | Abre un navegador real y lo usa como una persona, para probar. |
| 405 / 200 | "Esta dirección no acepta este tipo de pedido" / "recibido". |
| CSRF | Otra página usa tu navegador para mandarle un pedido a mi tienda. |
| JSON | El formato de datos que usa la tienda para comunicarse. |

## Antes de empezar

- [ ] **Ventana 1, incógnito:** https://programacion-tp-black.vercel.app, sin sesión (cliente).
- [ ] **Ventana 2:** la misma tienda, logueado como **admin**, en `/admin/productos`, con el stock de **Colombia Huila 250 g** anotado.
- [ ] **Datos a mano:**
  - usuario y contraseña del **comprador de prueba** de Mercado Pago. Hay que ingresar con él: como invitado, Mercado Pago rechaza el pago;
  - tarjeta de prueba `5031 7557 3453 0604`, `11/30`, código `123`, DNI `12345678`;
  - titular `APRO`.
- [ ] **Plan B:** si Mercado Pago tarda o falla, pagar por **transferencia** y confirmar el pago desde Pedidos, en el admin. Hace lo mismo que el aviso de Mercado Pago.
- [ ] **Reloj a la vista:** la demo va de 4:20 a 6:25. Si el profesor pregunta durante la demo, respondé corto y seguí.

## Diapositiva por diapositiva

**1 · Tapa** (0:00 – 0:10)
- "Buenas tardes, soy Agustín López Rizzuto y hoy les voy a presentar Origen Café: un e-commerce, o sea una tienda online, de café de especialidad, hecho con Next.js, Supabase y Mercado Pago, y publicado en Vercel."

**2 · Qué es Origen Café** (0:10 – 0:50)
- "¿Qué es Origen Café? En esta tienda se venden 6 cafés diferentes, en 3 tamaños, y accesorios de cafetería. El usuario elige la molienda de su café al comprar. Y se puede comprar sin crear un usuario, pagando con Mercado Pago o por transferencia."
- "Lo que diferencia a la tienda:
  - un test que le recomienda al usuario qué café comprar, según sus gustos;
  - la portada, con un video que avanza a medida que el usuario scrollea;
  - y los descuentos por volumen: 2 bolsas tienen 10% menos, y 3 bolsas, 20%."
- Señalar el celular: "Y es responsive, o sea que se adapta al tamaño de la pantalla, ya sea en la compu o en el celular."

**3 · De la primera versión a la final** (0:50 – 1:25)
- "Estos son los principales cambios desde la primera versión a la final."
- **Variantes de productos:** "Una variante es una versión del producto que se vende por separado, con su propio precio y stock. En mi caso, cada tamaño de bolsa. En el primer diseño, la molienda también era una variante: 6 cafés, por 3 tamaños, por 5 moliendas, daban 90 variantes. Pero la molienda no cambia el precio ni el stock, porque el grano es el mismo. Así que la dejé como una opción del pedido, y quedaron 18 variantes."
- **Test de café:** "Al principio, el test se calculaba en el navegador, que no conoce el stock real, así que podía recomendar un café agotado. En la versión final, el formulario le manda las respuestas a la API, y el servidor calcula la recomendación con los datos de la base: solo recomienda cafés con stock."
- **Portada:** "En la primera versión, la portada era solo el nombre de la tienda, y después un dibujo animado. En la versión final pude hacer un hero, que es la primera pantalla, con un video del grano a la taza que avanza con el scroll del usuario."

**4 · Tecnologías** (1:25 – 2:20)
- "Estas son las principales tecnologías que usé."
- **Next.js:** "La primera es Next. Es un framework basado en React para hacer aplicaciones web completas: junta las páginas y la lógica del servidor, o sea la API, en un mismo proyecto. Lo elegí porque simplifica el desarrollo y mantiene seguras las claves, que nunca llegan al navegador."
- **Supabase:** "Supabase me da la base de datos, que es Postgres, los usuarios y el almacenamiento de las imágenes. La elegí porque la consigna pedía SQL, que es el lenguaje de las bases de datos, y porque los permisos se definen dentro de la misma base."
- **Mercado Pago Checkout Pro:** "Es la solución de pagos: redirige al cliente a Mercado Pago para pagar, así que los datos de su tarjeta nunca pasan por la tienda. Y tiene un modo prueba, para probar pagos sin plata real."
- **Vercel y GitHub Actions:** "Vercel publica la tienda en internet. GitHub Actions corre las pruebas automáticas en cada cambio, y Vercel publica una copia de ese cambio para probarlo antes de sumarlo. Las dos se conectan solas con Next.js y GitHub."

**5 · Herramientas de IA** (2:20 – 3:00)
- "Las herramientas de IA que usé fueron cuatro:
  - Claude, para evaluar la idea al inicio y planificar el cronograma;
  - Claude Code, que fue mi herramienta principal: trabaja dentro del proyecto, edita archivos y corre comandos;
  - Higgsfield, una plataforma con distintos modelos de IA, que conecté a Claude Code para crear las fotos y el video de la página;
  - y la skill de seguridad de Cloudflare, que es un paquete de instrucciones listas para auditar la seguridad del proyecto."
- **Cómo revisé lo que proponía la IA:** "Para no sumar cualquier cosa que propusiera la IA, seguí siempre los mismos pasos:
  1. me explicaba qué iba a cambiar y yo lo aprobaba;
  2. hacía el cambio aparte, sin tocar la tienda publicada;
  3. corrían solas 121 pruebas automáticas;
  4. y lo probaba yo en la página. Recién ahí lo sumaba."

**6 · Arquitectura** (3:00 – 3:45, señalar de izquierda a derecha)
- **Navegador:** "El navegador es donde el usuario usa la tienda: ve productos, arma el carrito y completa formularios. Pero no toca la base de datos."
- **API (flecha de abajo):** "Cuando necesita algo, le habla a la API de Next.js con fetch, que permite mandar y recibir datos del servidor sin recargar la página. La API vuelve a validar los datos y los permisos, y recién ahí guarda o cobra."
- **Páginas (flecha de arriba):** "Las páginas se arman en el servidor. Leen el catálogo de Supabase con una clave pública, que está limitada por RLS: son reglas dentro de la base que deciden quién puede ver o cambiar cada fila."
- **Mercado Pago (flecha punteada):** "Y Mercado Pago procesa los pagos. Cuando cambia el estado de un pago, le avisa a mi API por un webhook, que es una dirección a la que Mercado Pago le manda el aviso. Así la tienda sabe si un pago se aprobó o se rechazó."

**7 · El recorrido de una compra** (3:45 – 4:20, remarcar los pasos en rojo: 3 y 5)
- "Este es el recorrido de los datos en una compra."
- **1 y 2:** "El navegador guarda solo la variante, la molienda y la cantidad. El checkout valida los datos y los envía a la API."
- **3:** "La API los vuelve a validar y calcula el total con los precios y el stock de Supabase. El precio nunca sale del navegador, porque ahí se puede modificar. Y guarda el pedido como pendiente."
- **4 y 5:** "Si el cliente elige Mercado Pago, la API crea el cobro y el cliente paga ahí. Cuando llega el aviso al webhook, verifico la firma, que es un código que solo Mercado Pago y yo podemos calcular, y le pregunto el pago a Mercado Pago. Si está aprobado y coinciden el pedido y el monto, confirmo el pedido y descuento el stock."
- **6:** "Y el cliente puede seguir su pedido con su código de seguimiento."
- **Transferencia:** "Si paga por transferencia, el pedido queda pendiente hasta que yo confirmo el pago desde el panel."

**8 · Demo en vivo** (4:20 – 6:25)
- "Ahora les voy a mostrar en vivo lo que les estuve contando."
1. **Portada (10 s):** "Esta es la portada, con el video que avanza con el scroll."
2. **Test (20 s):** bajar hasta el test (o tocar "Elegí tu café ideal" arriba). "Contesto las 4 preguntas y obtengo mi café ideal. La recomendación la calcula el servidor."
3. **Catálogo (15 s):** tocar "Ver todos los productos". "Acá puedo buscar y filtrar por perfil, tostado, precio o stock, y los filtros quedan en la dirección de la página." Filtrar Equilibrados y entrar a Colombia Huila.
4. **Carrito y pago (60 s):**
   - "Elijo el peso, la molienda y la cantidad (2 bolsas, con 10% de descuento) y lo agrego al carrito. El carrito también me sugiere accesorios."
   - Tocar "Finalizar compra" con el formulario vacío: "Si quiero comprar sin completar los datos, no me deja: cada campo tiene requisitos, y los valida el navegador y después la API."
   - Completar los datos y elegir Mercado Pago: "En modo prueba, Mercado Pago no deja pagar como invitado, así que entro con una cuenta de comprador de prueba y pago con una tarjeta de prueba."
   - Al volver: "Me devuelve a la tienda con el pedido confirmado y su código de seguimiento."
5. **Admin (20 s, ventana 2):** recargar `/admin/productos`. "Y en el panel de administrador, el stock ya bajó solo, porque lo confirmó el webhook. Desde acá también puedo crear, editar o borrar productos y variantes."

**9 · Base de datos: tablas y relaciones** (6:25 – 7:00, seguir las flechas)
- "La base empieza con los usuarios, que son opcionales, porque no hace falta registrarse para comprar."
- "Un usuario puede hacer muchas órdenes. Cada orden tiene sus datos (código, estado, envío y total) y muchos ítems, que son los productos de esa compra."
- "Cada ítem guarda la molienda, la cantidad y una copia del precio al momento de comprar, para que el historial no cambie si después cambia el precio. Y apunta a una variante, que tiene el peso, el precio y el stock."
- "Un producto tiene muchas variantes y muchas reseñas. Los cafés y los accesorios comparten la misma tabla."
- "Aparte están los mensajes de contacto, sin relación con las demás. Las tablas se crean con archivos .sql guardados en Git, que se llaman migraciones, y el seed carga los datos iniciales."

**10 · Cómo se usa y cómo se protege** (7:00 – 7:30)
- **CRUD:** "Desde el panel, el admin hace el CRUD completo, o sea alta, lectura, modificación y baja de productos, variantes y stock, siempre a través de la API. Lo vieron en la demo."
- **Confirmar un pago:** "Confirmar un pago es una transacción: o pasan las dos cosas, marcar el pedido pagado y descontar el stock, o ninguna. Y si Mercado Pago avisa dos veces, la segunda no hace nada."
- **Validación:** "Se valida en tres lugares, porque el navegador se puede modificar: en el navegador, en la API, y en la base con CHECK, que son reglas que la base revisa antes de guardar."
- **Permisos:** "Y los permisos son RLS: cada cliente ve solo sus pedidos, y solo el admin cambia el catálogo. Funcionan aunque alguien entre directo a Supabase, salteando mi tienda."

**11 · Peor prompt: el video del hero** (7:30 – 8:15)
- **Qué buscaba:** "Quería una portada donde el video avance a medida que scrolleás."
- **Prompt 1 y respuesta:** "Le pedí un hero donde al scrollear vaya pasando el video, como en las páginas de referencia. Claude detectó algo importante: yo tenía apagados los efectos de animación de Windows, y eso activa 'reducir movimiento', una opción para personas a las que las animaciones les molestan. Por eso yo veía una versión quieta. Rehízo el video, pero el hero seguía ocupando media pantalla, como un video en un recuadro."
- **Prompt 2 y respuesta:** "Ahí describí lo que tenía que pasar en la pantalla: que al scrollear avance la imagen, que no sea un recuadro y que ocupe toda la pantalla. Y salió bien: el video ocupa toda la pantalla y avanza cuadro por cuadro."
- **Qué cambió:** "El primer prompt decía qué cosa quería; el segundo, qué tenía que pasar. Por eso fue el peor: me costó varios intentos."
- **Cómo lo revisé:** "Con Playwright, que abre un navegador real y lo usa como una persona, en la compu y en el celular. Y lo probé yo: después pedí que tuviera menos zoom y que el scroll fuera más lento."

**12 · Mejor prompt: el aviso de Mercado Pago** (8:15 – 8:50)
- **Qué buscaba:** "Que Mercado Pago le avise a la tienda cuando se aprueba un pago, para confirmar el pedido solo."
- **Prompt:** "Mercado Pago tiene una herramienta para simular el aviso, y me daba error. En vez de describirlo, pegué la respuesta tal cual: un 405, que quiere decir 'esta dirección no acepta este tipo de pedido'. Yo sospechaba de las cuentas de prueba."
- **Respuesta:** "Claude respondió que el 405 era la pista clave, y que no eran las cuentas de prueba: la dirección que había cargado en Mercado Pago era solo el dominio, sin la ruta del webhook. El aviso le llegaba a la portada, que no recibe avisos."
- **Resultado:** "Corregí la dirección, y el aviso respondió 200, o sea recibido."
- **Por qué fue el mejor:** "Porque le di el error exacto y no mi interpretación, y fue directo a la causa."
- **Cómo lo revisé:** "Claude mandó un aviso de prueba a cada dirección posible y comparó las respuestas. Después repetí la simulación e hice un pago de prueba completo."

**13 · Prompt con skill: la auditoría de seguridad** (8:50 – 9:20)
- **Qué buscaba:** "Antes de entregar, quería revisar la seguridad. Usé la skill de Cloudflare que recomendó la cátedra."
- **Prompt:** "Fue de cuatro palabras: 'security audit this codebase'. Alcanza, porque las instrucciones detalladas ya vienen en la skill."
- **Respuesta:** "Me devolvió un informe con 7 pistas. La más importante: otra página podía mandar un formulario oculto a mi login y dejarte logueado en la cuenta del atacante. Este ataque se llama CSRF: otra página usa tu navegador para mandarle un pedido a mi tienda."
- **Arreglo:** "Ahora la API solo acepta pedidos que vienen de mi propia página y en formato JSON, que es el formato de datos que usa la tienda."
- **Cómo lo revisé:** "Cada arreglo tiene su test, y todos los tests tenían que estar en verde antes de sumarlo."

**14 · Dificultades y limitaciones** (9:20 – 9:50, contar dos dificultades y la primera limitación)
- **Supabase:** "En el plan gratis, Supabase se pausa a los 7 días sin uso, y una vez se cayó la tienda. Lo resolví con una tarea automática de GitHub que consulta la base todos los días."
- **Pruebas:** "Las pruebas que simulan compras crean pedidos y cuentas, así que no podían correr contra la base real. Usan una base de prueba aparte, que se prepara y se limpia sola."
- **Limitación principal:** "El stock no se reserva al crear el pedido, para que uno abandonado no bloquee bolsas. A cambio, si dos personas pagan la última bolsa al mismo tiempo, puede haber una sobreventa."
- "Lo demás son límites de alcance: Mercado Pago sigue en modo prueba, no se manda email de confirmación y la fecha de entrega no cuenta feriados."

**15 · Gracias** (9:50 – 10:00)
- "Muchas gracias. ¿Tienen alguna pregunta?"

## Si te preguntan durante la demo

**¿Qué pasa si pongo un email mal escrito?** El campo muestra el error y no deja seguir. Si alguien saltea el navegador, la API lo vuelve a validar y lo rechaza.

**¿Qué pasa si recargo la página o cierro la pestaña? ¿Se pierde el carrito?** No. El carrito queda guardado en el navegador (en el `localStorage`), solo con la variante, la molienda y la cantidad.

**¿Qué pasa si un café se queda sin stock?** En la tienda aparece "Sin stock" y no se puede agregar. Si igual llega un pedido, la API lo rechaza con un mensaje que dice cuántas bolsas quedan.

**¿Qué pasa si el pago se rechaza?** (Se prueba con el titular `OTHE`.) La tienda muestra "El pago no se completó, no se cobró nada" y se puede volver a intentar. El stock no se toca.

**¿Cómo llegó la confirmación tan rápido?** Mercado Pago le avisó al webhook. Mientras tanto, la página de seguimiento muestra "Estamos confirmando tu pago" y se actualiza sola.

**¿Me mostrás la API?** Abrir `/api/productos?perfil=intenso`: devuelve los cafés intensos en JSON, con los mismos filtros que el catálogo.

**¿Podés crear un producto?** Admin → Nuevo producto. Se cargan los datos y las variantes (peso, precio y stock), y se puede subir una foto. Si no tiene foto, se muestra una bolsa dibujada.

**¿Qué pasa si un usuario común entra al admin?** Si no inició sesión, lo manda a ingresar. Si inició sesión pero no es admin, ve "página no encontrada". Y aunque llame a la API o a Supabase directo, RLS no lo deja modificar nada.

**¿Y si compro con cuenta?** El pedido también aparece en "Mis pedidos". Cada cliente ve solo los suyos (RLS).

## Si te preguntan después

**¿Cómo que "las páginas se arman en el servidor"?** En Next.js, las páginas son por defecto *Server Components*: se ejecutan en el servidor, leen la base y mandan el HTML listo. Las partes con clicks (carrito, filtros, formularios) son componentes de cliente y corren en el navegador.

**¿Qué es la clave pública y la secreta?** La pública va al navegador y la limita RLS. La secreta saltea RLS y solo vive en el servidor; la uso, por ejemplo, para crear el pedido de quien compra sin cuenta.

**¿Qué pasa si Mercado Pago avisa dos veces el mismo pago?** La función que confirma el pago primero bloquea el pedido y mira su estado: si ya está pagado, no hace nada. Así el stock no baja dos veces.

**¿Cómo funciona la recomendación? ¿Usa IA?** No, son reglas con puntaje: cada respuesta suma puntos a los cafés según su tostado, su acidez y su cuerpo. Se muestra el que más puntos tiene, con su porcentaje de coincidencia, y la molienda según cómo lo preparás.

**¿Qué son las 121 pruebas automáticas?** 70 tests unitarios, que prueban funciones sueltas, como el cálculo del carrito o la firma del webhook, y 51 de punta a punta (E2E), que abren un navegador con Playwright y simulan compras completas. Corren en GitHub en cada cambio: eso es el CI. Y Vercel publica cada cambio solo: eso es el CD.

**¿Qué es un PR?** Un *pull request*: una propuesta de cambio que se revisa antes de sumarla a la versión principal. Cada tarea la hice en una rama aparte y la sumé con un PR (más de 25), cada uno con un checklist de qué se hizo y cómo se probó.

**¿Y la firma del webhook en modo prueba?** (Diapositiva oculta, después del mejor prompt.) En modo prueba, Mercado Pago firma los avisos con la clave de su cuenta vendedora de prueba, que yo no tengo, así que la firma nunca coincidía. No apagué la seguridad: en modo prueba le pregunto el pago a Mercado Pago con mi clave y solo confirmo si está aprobado, es de ese pedido y el monto es exacto. Con cuentas reales, la firma se exige.

**¿Por qué Supabase y no Firebase?** Firebase no usa SQL, y la consigna pedía SQL. Además, en Supabase los permisos (RLS) viven dentro de la base.

**¿Por qué no usaste el SDK de Mercado Pago?** El SDK es la biblioteca oficial. No hizo falta: son solo dos pedidos (crear el cobro y consultar un pago), y con `fetch` se ve exactamente qué se manda.

**¿Qué hiciste vos y qué hizo la IA?** La IA escribió la mayor parte del código. Yo:
- definí qué se hacía y en qué orden, y aprobé cada plan;
- probé todo en la página;
- encontré los problemas con datos reales, como el error 405;
- tomé las decisiones, como no reservar el stock o cómo verificar los pagos en modo prueba.
