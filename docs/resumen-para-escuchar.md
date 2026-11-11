# Origen Café, explicado de punta a punta

Este texto está pensado para leerlo en voz alta, grabarlo y escucharlo. Está en primera persona y sin símbolos ni código, para que suene natural. Leído con calma dura unos 15 minutos. El guion de la exposición está en [guion-demo.md](guion-demo.md).

## Parte uno: qué es la tienda

Origen Café es una tienda online de café de especialidad. La hice sola, de punta a punta, como trabajo integrador de Programación Web.

Vende seis cafés. Hay tres perfiles, con dos cafés cada uno: frutales y brillantes, equilibrados, e intensos. Cada café viene en tres tamaños de bolsa: doscientos cincuenta gramos, medio kilo y un kilo. Cada tamaño se llama **variante**, y cada variante tiene su propio precio y su propio stock. Seis cafés por tres tamaños dan dieciocho variantes. Además hay cuatro accesorios, como vasos de doble vidrio o una balanza, que se ofrecen como complemento en el carrito.

La molienda se elige al comprar: grano entero, fina para espresso, media fina para moka, media para filtro o gruesa para prensa francesa. Podría haber sido una variante más, pero no cambia ni el precio ni el stock, porque el grano es el mismo. Si fuera variante, tendría noventa combinaciones con stock propio. Por eso es una opción del pedido y se guarda junto a cada producto comprado.

Se puede comprar sin crear una cuenta: alcanza con el email. Cada pedido recibe un código, que empieza con O C, y con ese código se sigue el pedido desde la página de seguimiento. Si la persona sí tiene cuenta, sus pedidos también aparecen en "Mis pedidos".

Se paga de dos formas: con Mercado Pago, o por transferencia con un diez por ciento de descuento. Hay packs: dos bolsas iguales tienen un diez por ciento menos, y tres bolsas, un veinte por ciento. El envío cuesta seis mil quinientos pesos y es gratis desde cien mil.

Lo que la hace distinta son cuatro cosas:
1. **El test "Elegí tu café":** cuatro preguntas simples que recomiendan un café y la molienda ideal. No usa inteligencia artificial: son reglas con puntaje que suman puntos a cada café según su tostado, su acidez y su cuerpo.
2. **El hero**, que es la primera pantalla de la página. Tiene un video del grano a la taza que avanza cuando bajás con el scroll y retrocede cuando subís.
3. **Los packs con descuento.**
4. **El seguimiento con código.**

La tienda es **responsive**: se adapta al tamaño de la pantalla, así que funciona igual en una computadora y en un celular.

## Parte dos: las piezas y cómo se conectan

La tienda tiene cuatro piezas: el navegador, el servidor, la base de datos y Mercado Pago.

**El navegador** es lo que ve la persona. Ahí vive el carrito, guardado en un espacio del navegador que se llama **localStorage**, que no se borra al cerrar la pestaña. En el carrito guardo solo qué variante, qué molienda y cuántas unidades. Nunca precios, porque todo lo que está en el navegador se puede modificar.

**El servidor** está hecho con **Next.js**, un framework construido sobre **React**:
- React es la biblioteca que arma la interfaz con componentes, que son piezas reutilizables, como la tarjeta de un producto.
- Next.js agrega todo lo demás: cada carpeta del proyecto es una página, y en el mismo proyecto vive la **API**.

La API son las direcciones que empiezan con "barra api", que reciben pedidos del navegador y responden con datos. Esos datos viajan en **JSON**, que es el formato de datos de la web: texto ordenado con nombres y valores.

El navegador le habla a la API con **fetch**, que es pedirle datos al servidor sin recargar la página. Por ejemplo, cuando respondés el test, el formulario le manda tus respuestas a la API y la recomendación aparece sin que la página se recargue.

Las páginas del catálogo se arman en el servidor. En Next.js se llaman **Server Components**: leen la base de datos, arman el HTML y lo mandan listo. Así las claves de la base nunca llegan al navegador. Esas páginas se guardan armadas y se actualizan cada cinco minutos, o al instante cuando el admin cambia algo. Las partes que tienen clicks, como el carrito, los filtros o los formularios, son componentes de cliente y corren en el navegador.

**La base de datos** es **Supabase**. Supabase es una base **Postgres**, que es una base relacional: tablas conectadas entre sí, que se manejan con **SQL**, el lenguaje de las bases de datos. Supabase además trae el login de usuarios, el almacenamiento de las fotos y los permisos.

**Mercado Pago** cobra. Usé **Checkout Pro**: la persona paga en la página de Mercado Pago y después vuelve a la tienda. Así la tarjeta nunca pasa por mi servidor.

La tienda está publicada en **Vercel**, que la pone en internet y la actualiza sola cada vez que sumo un cambio.

Y una regla importante de esta arquitectura: **el navegador nunca escribe directo en la base**. Todo pasa por la API, que vuelve a validar los datos y decide.

## Parte tres: el recorrido de una compra

1. La persona agrega productos al carrito. En el navegador queda solo la variante, la molienda y la cantidad.
2. En el checkout completa sus datos. El formulario los valida en el navegador y muestra los errores al lado de cada campo. Si está todo bien, los manda a la API con fetch.
3. La API vuelve a validar todo con la misma función. Después busca en la base los precios y el stock reales y calcula el total: packs, descuento por transferencia y envío. **El precio siempre sale de la base, nunca del navegador**: aunque alguien modifique un precio en su navegador, se cobra el real. Con eso guarda el pedido en la base, con el estado "pendiente".
4. Si eligió Mercado Pago, la API crea el cobro en Mercado Pago por el total exacto. Ese cobro se llama **preferencia de pago**, y lleva el código del pedido. Mercado Pago devuelve un link, y la persona va a pagar ahí.
5. Cuando el pago se aprueba, Mercado Pago avisa a mi **webhook**, que es una dirección mía a la que Mercado Pago le manda un aviso cada vez que cambia un pago. Es al revés de lo habitual: acá el que llama es Mercado Pago.
6. No le creo al aviso así nomás:
   - Primero verifico la **firma**, un código que solo Mercado Pago y yo podemos calcular, porque compartimos una clave secreta. Si coincide, el aviso es auténtico.
   - Además, con mi propia clave, le pregunto a Mercado Pago cómo está ese pago.
   - Solo si está aprobado, es de ese pedido y el monto coincide exactamente, lo confirmo.
7. Confirmar significa dos cosas: marcar el pedido como pagado y descontar el stock.
8. La persona vuelve a la tienda y ve "pago confirmado". Con el código, puede seguir el pedido cuando quiera.

Si paga por transferencia, el pedido queda pendiente hasta que el admin confirma el pago desde el panel. Eso hace exactamente lo mismo que el aviso de Mercado Pago.

## Parte cuatro: la base de datos

Las tablas principales son seis:
- **productos:** cafés y accesorios juntos, con una columna que dice cuál es cuál.
- **variantes:** cada tamaño, con su precio y su stock.
- **pedidos** (en el código se llama ordenes).
- **ítems del pedido:** cada producto comprado, con su molienda y su cantidad.
- **perfiles:** el nombre y el rol de cada usuario, cliente o admin.
- **reseñas.**

Hay además una tabla de mensajes del formulario de contacto.

Las tablas se conectan con relaciones de **uno a muchos**, que se escribe "1 a N": un producto tiene muchas variantes, un pedido tiene muchos ítems. La conexión se hace con una columna que apunta a otra tabla, que se llama **clave foránea**. Por ejemplo, cada variante guarda el número del producto al que pertenece.

Dos detalles importantes del diseño:
- **El ítem del pedido guarda una copia del precio al momento de comprar.** Si mañana el precio cambia, el pedido viejo sigue mostrando lo que se cobró.
- **El pedido puede no tener usuario,** porque se puede comprar sin cuenta.

Las tablas no las creé a mano en la pantalla de Supabase. Están escritas en archivos SQL guardados en el repositorio, que se llaman **migraciones**, numeradas de la uno a la seis. Eso es lo que la consigna llama "SQL directo". Los datos iniciales (los cafés, las variantes y las reseñas) se cargan con otro archivo, el **seed**, que significa semilla.

El panel de administración hace el **CRUD** completo: crear, leer, actualizar y borrar, o en castellano, alta, baja y modificación. El admin crea productos, los edita con sus variantes, cambia el stock, sube fotos, oculta productos y confirma pagos.

La validación está en tres lugares:
1. **En el navegador**, por comodidad, para avisar rápido.
2. **En la API**, por seguridad, porque el navegador se puede modificar.
3. **En la base**, con reglas que se llaman **CHECK**: la base las revisa antes de guardar. Por ejemplo, la acidez tiene que estar entre uno y cinco, el stock no puede ser negativo y el email tiene un largo máximo. Si no se cumple, la base rechaza el dato.

Los permisos se manejan con **RLS**, que significa Row Level Security, o seguridad por fila: reglas dentro de la base que deciden quién puede ver o cambiar cada fila. Por ejemplo:
- cualquiera puede ver los productos visibles;
- cada cliente ve solo sus propios pedidos;
- solo el admin modifica el catálogo.

Lo bueno de RLS es que funciona aunque alguien intente entrar directo a Supabase, salteando mi tienda.

Hay dos claves de Supabase:
- **La pública** va al navegador, y está limitada por RLS.
- **La secreta** saltea RLS, así que solo vive en el servidor y nunca llega al navegador. La uso para lo que no tiene un usuario detrás: crear el pedido de alguien sin cuenta, recibir el aviso de Mercado Pago y mostrar el seguimiento.

Confirmar un pago es una función dentro de la base, y funciona como una **transacción**: o pasan las dos cosas juntas, marcar el pedido pagado y descontar el stock, o no pasa ninguna. Así nunca queda un pedido pagado sin stock descontado, ni al revés. Además:
- Si llegan dos avisos del mismo pago al mismo tiempo, la función **bloquea el pedido** y el segundo espera a que termine el primero.
- Si el pedido ya estaba pagado, la función no hace nada. Eso se llama **idempotente**: hacerlo dos veces da el mismo resultado que hacerlo una. Así el stock nunca baja dos veces.

## Parte cinco: seguridad

La idea central es no confiar en el navegador. Por eso los precios se recalculan en el servidor, se valida tres veces y hay permisos dentro de la base.

Al final hice una auditoría de seguridad con una **skill** de Cloudflare que recomendó la cátedra. Una skill es un paquete de instrucciones listas para una tarea; en este caso, auditar la seguridad de un proyecto. Con un pedido de cuatro palabras, revisó todo el código y encontró siete pistas. No confirmó ninguna vulnerabilidad, porque revisó el código sin poder ejecutarlo, pero las arreglé todas, cada una con su test.

La más importante fue un ataque que se llama **CSRF**: otra página usa tu navegador para mandarle un pedido a mi tienda sin que te des cuenta. En mi caso, una página maliciosa podía mandar un formulario oculto a mi login y dejarte logueado en la cuenta del atacante, y lo que compraras quedaba en su cuenta. El arreglo: ahora la API revisa que cada pedido venga de mi propia página y en formato JSON. Si viene de otro sitio, lo rechaza con un error **403**, que significa "prohibido". Si viene en otro formato, lo rechaza con un error **415**, que significa "formato no aceptado". Un formulario común de otra página no puede mandar JSON, así que queda bloqueado.

## Parte seis: cómo trabajé y cómo me aseguré de que funcione

Cada tarea la hice en una **rama** aparte, que es una copia del proyecto donde trabajo sin tocar la versión principal. Cuando terminaba, abría un **PR**, o pull request: una propuesta de cambio que se revisa antes de sumarla a la versión principal. Cada PR tiene un checklist con qué se hizo y cómo se probó. Hice más de veinticinco.

En cada PR, **GitHub Actions** corre los controles automáticos solo. Eso se llama **CI**, integración continua. Los controles son:
- el **lint**, que revisa el código buscando errores sin ejecutarlo;
- los **tests**;
- y comprobar que el proyecto compile.

Si algo falla, el PR queda en rojo y no se suma. Además, **Vercel** publica una copia del PR en su propia dirección, que se llama **preview**, para probarlo en el navegador antes de sumarlo. Y cuando se suma, Vercel publica la tienda actualizada solo. Eso es el **CD**, despliegue continuo. Juntos son el CI/CD que pide la consigna.

Hay dos tipos de tests:
- **Setenta tests unitarios**, que prueban funciones sueltas, como el cálculo del carrito, la firma del webhook o los filtros.
- **Cincuenta y un tests de punta a punta**, que se llaman **E2E**, por end to end. Usan **Playwright**, una herramienta que abre un navegador real y lo usa como una persona: agrega al carrito, compra, inicia sesión y usa el admin.

Como los tests E2E crean pedidos y cuentas, no podían correr contra la base real. Por eso usan otro proyecto de Supabase, solo para pruebas, que se prepara antes de empezar y se limpia al terminar.

## Parte siete: cómo usé la inteligencia artificial

Usé cuatro herramientas:
- **claude.ai**, para evaluar la idea contra la consigna y planificar el cronograma.
- **Claude Code**, para el desarrollo. Es un **agente**: una IA que trabaja dentro del proyecto, lee y edita archivos y corre comandos, pidiendo permiso. Sus reglas están en un archivo, **CLAUDE.md**, que lee al empezar cada sesión: explicarme cada cambio antes de hacerlo y esperar mi OK, una rama y un PR por tarea, y probar antes de guardar.
- **Higgsfield**, para generar las fotos de producto y el video de la portada, todos a partir de una misma foto de referencia para que parezcan de la misma sesión.
- **La skill de Cloudflare**, para la auditoría de seguridad.

Mi forma de revisar lo que hacía la IA fue siempre la misma: primero el plan y mi OK; después la rama, el PR, los tests en verde y la prueba en el navegador. Nada entró sin pasar por eso.

**El peor prompt fue el del hero.** Pedí "un hero interactivo con video", y tres veces salió un video en un recuadro. El problema era que describía la cosa y no el comportamiento. Y había una causa escondida: yo tenía apagados los efectos de animación de Windows. Eso activa en el navegador una preferencia que se llama **reducir movimiento**, pensada para personas a las que las animaciones les molestan, y yo veía la versión alternativa, la del recuadro. Cuando escribí "que al scrollear avance la imagen del video y ocupe toda la pantalla", salió bien. Ahora el video siempre avanza con el scroll, acercándose de a poco al punto donde estás, para que se vea suave aunque scrollees rápido.

**El mejor prompt fue el del webhook.** Mercado Pago no lograba avisarme los pagos. En vez de describir el problema, pegué la respuesta exacta del error: **405**, que significa "esta dirección no acepta este tipo de pedido". Con eso se encontró la causa enseguida: la dirección del webhook tenía solo el dominio, entonces el aviso le llegaba a la portada, que no recibe avisos. La lección: el error textual vale más que mi interpretación.

**Después vino la segunda parte: la firma nunca coincidía,** y el servidor rechazaba los avisos con un error **401**, que significa "no autorizado". Hice que el servidor anotara qué llegaba y se lo pasé a Claude. La causa: en el modo de prueba de Mercado Pago, que se llama **sandbox**, los avisos los firma la cuenta vendedora de prueba, con una clave que yo no tengo. La solución no fue apagar la seguridad: en modo prueba, le pregunto el pago a Mercado Pago con mi clave y verifico que esté aprobado, que sea de ese pedido y que el monto sea exacto. Con cuentas reales, la firma se exige.

## Parte ocho: dificultades, decisiones y limitaciones

**Dificultades que resolví:**
- **Supabase pausa los proyectos gratuitos** después de siete días sin uso, y una vez se cayó la tienda publicada. Lo resolví con una tarea automática de GitHub que consulta la base todos los días.
- **En el sandbox, Mercado Pago rechaza el pago si pagás como invitado.** Hay que ingresar con una cuenta de comprador de prueba.
- **Las previews de Vercel piden login,** así que Mercado Pago no podía avisarles. El webhook apunta siempre a la tienda publicada.

**Decisiones importantes:**
- **El carrito vive en el navegador** y recién se guarda en la base al comprar.
- **El stock se descuenta al pagar,** no al crear el pedido, para que un pedido abandonado no bloquee bolsas. A cambio, si dos personas pagan la última bolsa al mismo tiempo, puede haber una **sobreventa**. La base no deja que el stock quede negativo, y con más tiempo lo resolvería reservando el stock por unos minutos.

**Limitaciones que quedaron:**
- Mercado Pago sigue en modo prueba.
- No se manda un email de confirmación.
- No hay recuperación de contraseña.
- La fecha de entrega no tiene en cuenta los feriados.
- Las reseñas son de ejemplo.

## Cierre: las cinco ideas para recordar

1. Es una tienda de café con variantes por tamaño y molienda elegida al comprar, que se puede usar sin cuenta.
2. El navegador nunca decide nada importante: los precios y los permisos se resuelven en el servidor y en la base.
3. Un pago se confirma solo si Mercado Pago avisa y yo lo verifico; confirmarlo marca el pedido pagado y descuenta el stock, todo junto o nada.
4. Todo cambio pasó por una rama, un PR, los tests automáticos y una prueba en el navegador.
5. La IA escribió mucho código, pero el plan, la revisión, el diagnóstico de los problemas y las decisiones fueron míos.
