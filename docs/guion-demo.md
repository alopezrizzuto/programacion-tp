# Guion de la demo: Origen Café

Recorrido de unos 12 minutos para la defensa, más las preguntas técnicas que probablemente aparezcan, con una respuesta corta para cada una.

## Antes de empezar (5 minutos antes)

- [ ] **Ventana 1, incógnito:** https://programacion-tp-black.vercel.app, sin sesión. Es la del cliente.
- [ ] **Ventana 2, normal:** la misma demo, logueado con la cuenta **admin**, abierta en `/admin`.
- [ ] **Pestañas de apoyo:**
  - GitHub, con la lista de PRs cerrados y la pestaña **Actions**;
  - Supabase (Table Editor: `ordenes`, `variantes`);
  - Mercado Pago Developers (Webhooks → historial de notificaciones).
- [ ] **Datos de prueba a mano:**
  - email `test_user_123@testuser.com`;
  - tarjeta Mastercard `5031 7557 3453 0604`, `11/30`, código `123`, DNI `12345678`;
  - titular `APRO` (aprobado).
- [ ] **Plan B:** si falla internet o Vercel, `npm run dev` en la compu (con `.env.local`) y seguir en `http://localhost:3000`. Sin webhook, el pago se confirma a mano desde el admin.
- [ ] Anotar en un papel el stock actual de **Colombia Huila 250 g**, para mostrar que baja al confirmar el pago.

## Recorrido

### 1. Presentación y portada (1,5 min)

- "Origen Café es una tienda de café de especialidad: 6 cafés en 3 pesos, la molienda se elige al comprar, y hay 4 accesorios. Next.js con App Router, Supabase, Mercado Pago y Vercel."
- Bajar por el **hero**: el video avanza con el scroll (`currentTime`, con suavizado) y los textos cambian en momentos fijos. Mencionar el link "Saltear el recorrido".
- Mostrar "Nuestros cafés" y los beneficios ("Comprar es simple").

### 2. Test "Elegí tu café ideal" (1 min) · E3

- Responder: Fuerte, Poco, Con leche, Espresso. Mostrar que se avanza de a una pregunta y que se puede volver a un paso.
- "Ver mi café": **las respuestas viajan con `fetch` a `POST /api/recomendacion`**, que valida y calcula en el servidor. La recomendación sale con su % de coincidencia, los motivos y la molienda sugerida.
- "Agregar al carrito": entra con la molienda **fina** ya elegida.

### 3. Catálogo y API (1,5 min) · E4

- `/productos`: filtrar por **Frutales**. La URL cambia (`?perfil=frutal`), así que el link se puede compartir y el botón atrás funciona.
- Buscar "chocolate": encuentra por notas y no importan las tildes.
- Abrir **`/api/productos?perfil=intenso&peso=1000`** en otra pestaña: la API devuelve el mismo filtro en JSON (comparten `lib/catalogo.js`).

### 4. Producto y carrito (1,5 min)

- Abrir **Colombia Huila**, peso **250 g**, molienda **Media**, pack de **2 bolsas (−10%)**.
- Mostrar el stock real ("Quedan solo…"), las cuotas, el precio por transferencia y la fecha de entrega estimada.
- Panel del carrito:
  - el contador del header cambia;
  - aparece el **upsell** de accesorios;
  - la barra marca cuánto falta para el envío gratis.
- "El carrito vive en el navegador (`localStorage`) y guarda solo ids y cantidades: nunca precios."

### 5. Checkout con Mercado Pago y webhook (2,5 min) · E6

- `/checkout`, sin cuenta. Enviar vacío para mostrar los **errores por campo**. Completar con el email `test_user_…`, elegir **Mercado Pago** y pagar.
- En Mercado Pago: tarjeta de prueba, titular **APRO**. Vuelve a `/seguimiento/OC-…`.
- Mientras se actualiza: "Mercado Pago avisa al **webhook**. El servidor verifica la firma, **le pregunta el pago a Mercado Pago** (no le cree al aviso), controla que el monto sea el del pedido y llama a `confirmar_pago`, una función SQL que marca el pedido como pagado y descuenta el stock en una sola transacción."
- El estado pasa a **Pago confirmado**. En Supabase, el stock de Colombia Huila 250 g bajó 2.

### 6. Transferencia y admin (2 min) · E5

- En la ventana 1, otro pedido por **transferencia**: 10% OFF y los datos para transferir. Copiar el código.
- En la ventana 2 (admin) → **Pedidos → Esperando pago**: buscar el pedido, **Confirmar pago** y después **Marcar como enviado**.
- En el seguimiento del cliente se ve el nuevo estado.

### 7. CRUD del admin (1,5 min) · E5

- **Productos:** cambiar el stock de una variante desde la lista y ocultar o mostrar un producto.
- **Cargar café** con su variante y foto (se sube a Supabase Storage) y verlo en la tienda. Después borrarlo.
- "Cada acción pasa por la API, que chequea el rol admin, y la base vuelve a chequearlo con **RLS**. Aunque alguien saltee la página, la base no lo deja."

### 8. Cuenta del cliente (0,5 min) · E3

- Registrarse, comprar y ver el pedido en **Mis pedidos** (`/cuenta`). Sin sesión, `/cuenta` lleva a ingresar.
- Si en producción está activado "Confirm email", el registro pide confirmar el mail: en ese caso, usar una cuenta de cliente ya creada.

### 9. Calidad: PRs, CI, tests y seguridad (1 min) · E1

- GitHub: un PR con su checklist y el **CI en verde**:
  - el job `build` corre lint, 70 tests unitarios y el build;
  - el job `e2e` corre 51 tests de Playwright contra una base de prueba.
- Vercel: la preview de un PR.
- Seguridad: "Corrimos la auditoría de seguridad de Cloudflare que recomendó la cátedra. No encontró vulnerabilidades confirmadas y dejó 7 pistas que arreglamos, cada una con su test. Por ejemplo, el login rechaza pedidos que vienen de otro sitio (CSRF)." Está en la sección Seguridad del README.

## Preguntas probables

**¿Qué es un Server Component y qué uno de cliente?** El Server Component se ejecuta en el servidor y manda HTML: lo usan las páginas que leen la base. El de cliente (`"use client"`) corre en el navegador y puede tener estado y eventos: el carrito, los filtros y los formularios.

**¿Por qué el precio no sale del carrito?** Porque el navegador se puede modificar. El carrito manda solo variante, molienda y cantidad, y `armarOrden` recalcula precios, packs, descuentos y envío con los datos de la base. Si alguien cambia un precio en su navegador, el pedido se cobra igual al precio real (hay un test que lo prueba).

**¿Qué es RLS?** *Row Level Security*: reglas en la base que deciden qué filas puede ver o cambiar cada usuario. Cada cliente ve solo sus pedidos y solo un admin modifica productos. Funciona aunque alguien use la clave pública directo contra Supabase.

**¿Clave pública y clave secreta?** La pública va al navegador y está limitada por RLS. La secreta saltea RLS y solo se usa en el servidor, en lo que no depende de una sesión: crear pedidos (se compra sin cuenta), el webhook y el seguimiento por código. Nunca llega al navegador porque no empieza con `NEXT_PUBLIC_`.

**¿Cómo sabés que el aviso del webhook es real?** Por dos controles. Primero, la firma HMAC del encabezado `x-signature`, hecha con una clave que solo conocemos nosotros y Mercado Pago. Segundo, y es lo más importante, el servidor le pide el pago a Mercado Pago con nuestro token y solo confirma si está aprobado, es de ese pedido y el monto coincide.

**¿Y si el aviso llega dos veces?** `confirmar_pago` bloquea la fila del pedido y solo actúa si está pendiente o rechazado. La segunda vez no hace nada, así que el stock no se descuenta dos veces.

**¿Por qué el stock baja al pagar y no al crear el pedido?** Para que un pedido abandonado no bloquee stock. El costo es que dos personas pueden pedir la última bolsa a la vez; se ve al confirmar y queda anotado como mejora.

**¿Por qué la molienda no es una variante?** No cambia el precio ni el stock. Como variante serían 90 combinaciones (6 cafés × 3 pesos × 5 moliendas) en lugar de 18.

**¿Cómo se actualiza la tienda si cambia la base?** Las páginas se regeneran cada 5 minutos (`revalidate = 300`), y cada cambio del admin las regenera al instante (`revalidatePath`). `/productos` se arma en cada visita porque depende de los filtros de la URL.

**¿Cómo se valida un formulario?** Con la misma función en el navegador (avisa antes de enviar) y en el servidor (no confía en lo que llega). Los errores vuelven por campo y se muestran al lado de cada uno.

**¿Qué prueban los tests?**
- **Unitarios:** la lógica pura (carrito, órdenes, firma del webhook, filtros, validaciones, fecha de entrega).
- **E2E:** la tienda en un Chrome real (comprar, registrarse, el admin, la API y el webhook), contra una base de Supabase solo para tests que se prepara y se limpia sola.

**¿Qué encontró la auditoría y por qué nada quedó "confirmado"?** Se corrió solo revisando el código, porque la compu no tenía un sandbox para ejecutar, y la skill confirma solo lo que ve funcionar. Dejó 7 pistas, todas arregladas con su test:
- login CSRF;
- una redirección abierta con un tab escondido;
- un regex de email que se podía trabar;
- campos sin largo máximo;
- formularios sin límite de envíos;
- límites de Supabase Auth compartidos;
- el registro que revela si un email existe (documentado como decisión).

**¿Por qué se puede comprar sin cuenta?** Para que comprar tenga menos pasos. El código de seguimiento (`OC-` y 10 caracteres al azar, más de mil billones de combinaciones) reemplaza a la cuenta para ver el pedido.
