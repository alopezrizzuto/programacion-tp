# Conceptos que se nombran en la exposición

Explicación corta de cada término que aparece en las diapositivas o en el [guion](guion-demo.md), en el orden en que se nombran. El detalle técnico está en el [README](../README.md).

## Tecnologías

- **Full-stack:** el proyecto tiene las dos partes, lo que corre en el navegador (front) y lo que corre en el servidor (back), con la base de datos.
- **Next.js:** framework sobre React. Cada carpeta dentro de `app/` es una URL: un `page.js` es una página y un `route.js` es una API. Así, páginas y API viven en un mismo proyecto.
- **React:** biblioteca para armar la interfaz con **componentes**, funciones que devuelven HTML y se reutilizan (por ejemplo, la tarjeta de un producto).
- **Server Component:** componente que se ejecuta en el servidor. Puede leer la base sin mostrar claves y manda el HTML listo. Es el tipo por defecto en Next.
- **Client Component (`"use client"`):** componente que se ejecuta en el navegador y tiene estado y clicks. Así son el carrito, los filtros, los formularios y el hero.
- **Responsive:** la misma página se adapta al ancho de la pantalla (celular, tablet, computadora).
- **Tailwind CSS:** CSS escrito con clases cortas directamente en el HTML (`p-4`, `text-lg`). La paleta de colores se define una sola vez.
- **Supabase:** servicio que trae una base **Postgres** (relacional, con SQL), login (**Auth**), archivos (**Storage**, para las fotos) y permisos dentro de la base (**RLS**).
- **SQL directo:** las tablas se crean escribiendo SQL a mano, en archivos versionados, no con una herramienta que lo genera.
- **Mercado Pago Checkout Pro:** la persona paga en la página de Mercado Pago y vuelve a la tienda. La tarjeta nunca pasa por mi servidor.
- **SDK:** una biblioteca oficial para usar un servicio. No usé el de Mercado Pago porque son solo dos pedidos HTTP (crear el cobro y consultar el pago), y alcanza con `fetch`.
- **fetch:** la función de JavaScript para pedirle datos a un servidor sin recargar la página. La respuesta suele venir en **JSON**, texto con formato de objeto (`{"nombre": "Kenia AA"}`).
- **Vercel:** donde está publicada la tienda.
- **GitHub Actions:** corre tareas automáticas en GitHub (el CI y la consulta diaria a Supabase).
- **ffmpeg:** programa para convertir video. Lo usé para que cada cuadro del video sea independiente y adelantar o retroceder con el scroll sea fluido.

## IA

- **Agente (Claude Code):** una IA que trabaja dentro del proyecto: lee y edita archivos y corre comandos, pidiendo permiso.
- **`CLAUDE.md`:** archivo con las reglas que el agente lee al empezar cada sesión: explicar antes de cambiar, una rama por tarea, probar antes de commitear.
- **Prompt:** el pedido que se le escribe a la IA.
- **Skill:** un paquete de instrucciones para una tarea. La de Cloudflare trae un método completo de auditoría de seguridad. Por eso alcanzó un prompt de cuatro palabras.
- **Agentes en paralelo:** la skill lanzó 40 revisores, cada uno con una parte del código.

## Arquitectura y recorrido

- **API (Route Handlers):** las URLs de `/api/...` que reciben pedidos y responden JSON. En Next.js cada una es un archivo `route.js`.
- **Métodos HTTP:** `GET` lee, `POST` crea, `PATCH` modifica y `DELETE` borra.
- **localStorage:** un espacio del navegador que guarda texto y sobrevive al cerrar la pestaña. Ahí está el carrito, con solo variante, molienda y cantidad, nunca precios.
- **"Se regeneran cada 5 minutos" (`revalidate = 300`):** la página se arma una vez y se guarda, para que cargue rápido. Cada 5 minutos se vuelve a armar con datos nuevos, y al instante cuando el admin cambia algo.
- **Webhook:** una URL mía que **Mercado Pago llama** cuando cambia un pago. Es al revés de lo habitual: el que avisa es el otro servicio.
- **Preferencia de pago:** el "cobro" que mi servidor crea en Mercado Pago, con los productos, el total exacto, el código del pedido y la URL del webhook. Mercado Pago responde con el link de pago.

## Demo

- **Validación:** revisar que los datos estén bien antes de usarlos (campos vacíos, email válido) y mostrar el error al lado de cada campo.
- **Filtros en la URL:** los filtros elegidos quedan en la dirección (`/productos?perfil=frutal`). Se puede compartir el link o volver atrás.
- **Sandbox:** el modo de prueba de Mercado Pago. Se paga con tarjetas falsas y cuentas de prueba (vendedor y comprador). El titular `APRO` simula un pago aprobado.

## Base de datos

- **Tabla, fila y columna:** como una planilla. Cada producto es una fila; nombre, precio, etc. son columnas.
- **Clave primaria y foránea:** la primaria es el `id` único de cada fila. La foránea es una columna que apunta a otra tabla, como `variantes.producto_id`, que apunta al producto.
- **Relación 1 a N:** una fila se conecta con muchas de otra tabla. Un producto tiene muchas variantes; un pedido tiene muchos ítems.
- **Migración y seed:** la migración es un archivo `.sql` numerado (001 a 006) que crea o cambia tablas; el seed carga los datos iniciales. Los dos quedan en Git.
- **CRUD (ABM):** alta, lectura, modificación y baja. Es lo que hace el panel admin con productos, variantes y stock.
- **`CHECK`:** una regla que la base verifica en cada alta o cambio. Por ejemplo, acidez entre 1 y 5, tostado dentro de una lista, o un largo máximo. Si no se cumple, la base rechaza el dato.
- **RLS (Row Level Security):** reglas dentro de Postgres que deciden qué filas puede ver o cambiar cada usuario ("cada cliente ve sus pedidos", "solo el admin modifica productos"). Protegen aunque alguien use la clave pública directo contra Supabase.
- **Clave pública y clave secreta:** la pública va al navegador y la limita RLS. La secreta saltea RLS y solo vive en el servidor. Las variables que empiezan con `NEXT_PUBLIC_` llegan al navegador; la secreta no lleva ese prefijo.
- **Transacción:** varias operaciones que pasan todas juntas o ninguna. `confirmar_pago` descuenta el stock y marca el pedido como pagado en una sola transacción.
- **Bloquear la fila (`FOR UPDATE`):** si llegan dos avisos del mismo pago a la vez, el segundo espera a que termine el primero.
- **Idempotente:** hacerlo dos veces da el mismo resultado que hacerlo una. Si el pedido ya está pagado, `confirmar_pago` no hace nada.

## Prompts, seguridad y problemas

- **Reducir movimiento (`prefers-reduced-motion`):** una preferencia de accesibilidad del sistema para quienes se marean con las animaciones. En Windows se activa al apagar los "efectos de animación".
- **Playwright:** herramienta que abre un Chrome real y usa la página como una persona, para probarla.
- **Códigos HTTP:** el número con que responde el servidor:
  - 200: bien;
  - 401: sin permiso por falta de credenciales;
  - 403: prohibido;
  - 405: esa URL no acepta ese método (por ejemplo, la portada no acepta POST);
  - 415: el formato del pedido no es el esperado (no es JSON).
- **Log:** un mensaje que el servidor escribe para ver qué está pasando. Puse uno temporal para ver qué llegaba al webhook.
- **Firma HMAC:** Mercado Pago calcula un código con un secreto compartido sobre los datos del aviso. Yo calculo el mismo y comparo: si coinciden, el aviso es auténtico y no fue modificado.
- **Token (Access Token):** la clave privada con que mi servidor se identifica ante Mercado Pago para crear cobros y consultar pagos.
- **CSRF:** otro sitio hace que tu navegador mande un pedido a mi tienda sin que te des cuenta. En el *login CSRF*, te deja logueado en la cuenta del atacante. Se frena rechazando los pedidos que vienen de otro sitio y los que no son JSON.
- **Vulnerabilidad confirmada y pista:** la skill confirma una vulnerabilidad solo si la ve funcionar. Como revisó el código sin ejecutarlo, todo quedó como pistas a validar; igual las arreglé.

## Calidad y despliegue

- **Rama y PR (pull request):** cada tarea va en su propia rama. El PR pide sumarla a `main`, con un checklist de qué se hizo y cómo se probó.
- **CI (integración continua):** en cada PR, GitHub Actions corre lint, tests y build. Si algo falla, el PR queda en rojo.
- **CD (despliegue continuo):** Vercel publica `main` en producción sin pasos manuales.
- **Preview:** una URL propia de cada PR en Vercel, para probarlo antes de unirlo.
- **Lint:** revisa el código buscando errores y malas prácticas sin ejecutarlo (ESLint).
- **Test unitario:** prueba una función suelta, como el cálculo del carrito o la firma del webhook. Hay 70, con `node:test`.
- **Test E2E (de punta a punta):** prueba la tienda completa en un navegador real, por ejemplo una compra entera. Hay 51, con Playwright, contra un proyecto de Supabase solo para tests.
- **Sobreventa:** vender más unidades de las que hay. Puede pasar porque el stock se descuenta al pagar y no al crear el pedido.
