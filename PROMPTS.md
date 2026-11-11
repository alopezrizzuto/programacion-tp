# Bitácora de prompts

Registro de los prompts usados con IA durante el proyecto. Los marcados con ⭐ son interesantes para la presentación (errores, fallos, decisiones importantes).

**Formato de cada entrada**
- **Fecha / herramienta** (claude.ai, Claude Code)
- **Prompt** (resumido o textual)
- **Resultado**: qué hizo la IA
- **Problema / aprendizaje** (si hubo)

---

## 1. ⭐ Definición de la idea y planificación — 29/09/2026 (claude.ai)
**Prompt:** Le pasé la consigna y la rúbrica, le pedí que evaluara mi idea (e-commerce simple con un producto con variantes de diseño y medida) y que propusiera otras.
**Resultado:** Se eligió una tienda de manteles antimanchas: cada diseño es un producto con variantes por medida (precio y stock propios). Se armó un cronograma de 9 semanas alineado a los entregables E1–E6.
**Aprendizaje:** Con solo 3 productos el filtrado no tiene sentido; hace falta un seed de 8–12 diseños con varias medidas. Next.js ya es React, no hace falta "empezar en React y migrar".

## 2. Pasar el proyecto a Claude Code — 29/09/2026 (claude.ai)
**Prompt:** "¿Cómo paso este proyecto a Claude Code?"
**Resultado:** Claude Code no ve los chats de claude.ai. El contexto se pasa con un `CLAUDE.md` en la raíz del repo, que se lee al inicio de cada sesión.

## 3. ⭐ Cambio de idea base: de manteles a café — 29/09/2026 (Claude Code)
**Prompt:** Le pedí cambiar la idea base del proyecto a una tienda de café de especialidad y actualizar `CLAUDE.md`, la portada y la bitácora, explicando antes qué archivos iba a tocar.
**Resultado:** Cambio de idea base de manteles a café de especialidad. Se definieron 3 perfiles con 2 cafés cada uno, variantes por peso y molienda como opción del pedido (no variante) para evitar 90 combinaciones de stock. Se agregó el cuestionario "Elegí tu café" como parte de E3. Nombre provisorio de la tienda: "Origen Café".

## 4. ⭐ El webhook respondía 405 — 22/10/2026 (Claude Code)
**Prompt (textual):** Pegué la respuesta del simulador de Mercado Pago ("405 - Method Not Allowed. Tu servidor reconoce el recurso solicitado pero el método HTTP de solicitud no es reconocido.") y escribí: "No aparece nada. Hay otra forma de solucionarlo? Ya me habian advertido que habia problemas con las cuentas de prueba de Mercado Pago."
**Resultado:** El problema no eran las cuentas de prueba. La URL del webhook tenía solo el dominio, así que el aviso le pegaba a la portada, que no acepta POST. Se corrigió a `/api/webhooks/mercadopago` y respondió 200.
**Aprendizaje:** Pegar la respuesta exacta del error ayudó más que describirlo con mis palabras.

## 5. ⭐ La firma del webhook nunca coincidía — 22/10/2026 (Claude Code)
**Prompt (textual):** "Webhook con firma inválida: {"consulta":"?data.id=184531371541&type=payment", …, "claveCargada":true, …, "live_mode":true, "user_id":"3764306475"} No cargue la clave. Cargue una access token, y una webhook secret"
**Resultado:** Un log temporal mostró qué llegaba exactamente: en el sandbox, los pagos los firma la cuenta vendedor de prueba, con una clave que no tenemos. Solución: `MERCADOPAGO_SANDBOX=true` deja seguir sin firma, y la seguridad la da consultarle el pago a Mercado Pago (aprobado, de ese pedido y con el monto exacto). Con credenciales reales, la firma se exige.
**Aprendizaje:** Antes de cambiar código, agregar un diagnóstico para ver el dato real.

## 6. ⭐ El hero: el peor prompt y cómo lo corregí — 01/10 al 28/10/2026 (Claude Code)
**Prompts (textuales, en orden):**
1. "Pagina de inicio: debe tener un efecto donde al scrollear hacia abajo, se mueve una imagen/video (…) que cubre toda la pantalla."
2. "Hay un error de concepto. El Hero no debe ser un Hero de Video comun, donde el video se reproduce. Debe ser un Hero en el cual al scrollear, va pasando el video (…)"
3. "El Hero sigue siendo un video (el video se corrigio, me gusta mas), pero no es lo que te pedi. Yo necesito que al scrollear vaya avanzando la iamgen. Que no sea un video en una cuadricula. Que ocupe la mayor parte de la pantalla, o toda, y cuando el usuario hace scroll hacia abajo, vaya avanzado la imagen (del video)."
4. "Muy bueno. Me gustaria que el video del hero no se vea tan zoomeado, y que tampoco pierda calidad. Tambien, que el scroll no sea tan rapido, ya que el video no se termina de entender si el scroll se hace tan rapido."
**Resultado:** Tenía apagados los "efectos de animación" de Windows, eso activa "reducir movimiento" en el navegador, y yo veía la versión alternativa: un video quieto en un recuadro. Ahora el video avanza con el scroll siempre, a pantalla grande, re-codificado con ffmpeg y con suavizado.
**Aprendizaje:** Describir el comportamiento esperado, no el nombre del componente, y corregir con observaciones concretas. Cada versión se verificó con Playwright antes del commit.

## 7. ⭐ Auditoría de seguridad — 09/11/2026 (Claude Code + skill de Cloudflare)
**Prompt (textual):** "security audit this codebase"
**Resultado:** 40 agentes revisaron el código: 0 vulnerabilidades confirmadas y 7 pistas. La más importante fue el login CSRF (otra página podía dejarte logueado en la cuenta de un atacante). Se arreglaron las 7, cada una con su test, en el PR `fix/seguridad`.
**Aprendizaje:** Un prompt corto alcanza cuando la herramienta ya trae el método; lo importante fue revisar cada arreglo con tests antes de mergear.

## 8. Migración 006 ejecutada dos veces — 10/11/2026 (Supabase)
**Error (textual):** "Failed to run sql query: ERROR: 42710: constraint "ordenes_email_largo" for relation "ordenes" already exists"
**Resultado:** La primera ejecución había funcionado (se cerró la ventana, pero se aplicó). Se verificó con una consulta a `pg_constraint` que estaban las 8 restricciones.

---

Antes de mergear, verificá que el PR tenga todos los commits.

---

Error: el borrado de app/login se coló en el primer commit, porque lo había preparado antes con git rm. Como no estaba subido, deshice ese commit y lo rehice con los archivos correctos.

Lección: antes de commitear, revisar con git diff --cached qué está preparado.

Error: al ajustar con sed la regla que valida la URL de la foto, se perdió una barra invertida (\) de la expresión regular, y el código quedó mal escrito. Lo detecté al revisarlo y lo corregí con Edit antes de commitear. Lección: para cambios con caracteres especiales, editar el archivo directo y no usar la terminal.

Prueba automática que fallaba sin error de la app: la prueba esperaba a que la red quedara quieta, y Next precarga páginas en segundo plano, así que eso nunca pasaba. Además, esperaba un tiempo fijo en lugar de la respuesta del servidor. Lo corregí en el script; la app no tenía errores.

---

El proyecto de Supabase se pausó por una semana sin actividad, y con eso se cayó también la tienda publicada. Solución: el workflow diario que lo mantiene activo.

Me equivoqué al escribir un await dentro de una función que no era async (en la página de pedidos del admin). El build lo detectó y lo corregí.

Mercado Pago bloqueó al navegador automático ("Hubo un error accediendo a esta página") porque se identificaba como HeadlessChrome. Con un navegador normal funcionó.

"Una de las partes con la que intentás hacer el pago es de prueba": en el sandbox, el email del comprador tiene que ser test_user_…@testuser.com. Queda documentado en el README.

Git Bash rompe las tildes al mandar JSON con curl (por ejemplo, "Ciudad Autónoma"). Para probar la API conviene usar scripts de Node.

La URL del webhook en Mercado Pago estaba mal: tenía una dirección distinta a la de producción. Ya la corregiste.

Las direcciones de Vercel con -itba5 y las de cada deploy piden login, así que Mercado Pago no las puede usar. Hay que usar siempre el dominio de producción.

La URL del webhook en Mercado Pago tenía solo el dominio, sin /api/webhooks/mercadopago, y por eso daba 405 y los avisos nunca llegaban. Para detectarlo, mandé un POST a cada dirección posible y comparé las respuestas.

Accesorios en celular: en tarjetas de dos columnas, las estrellas se pisaban con la tarjeta de al lado. Lo detecté en las capturas y las pasé debajo del nombre.

Rendimiento de la portada: la animación de entrada del título bajaba el rendimiento a 82. Lección: lo primero que hay que leer no se anima.

Con "reducir movimiento", en compu la imagen fija se estiraba a 1798 px, porque el alto de pantallas grandes le ganaba al automático. Lo detecté midiendo el tamaño en el navegador y lo corregí.

Esta vez revisé qué estaba preparado antes de cada commit y no filtré la salida con grep. No se repitió el error de los commits mezclados.

La primera versión del hero era un video común, que se reproducía solo y con las tomas equivocadas. La molienda salía de la cafetera y faltaba el molinillo. Se corrigió a un video que avanza con el scroll y con las tomas reales.

Modifiqué los archivos del video antes de crear la rama nueva, estando todavía en la rama ya mergeada. Lo deshice y lo rehice en la rama correcta, sin pérdidas.

La primera versión dejaba la barra lateral fija al bajar. Como mide más que la pantalla, quedaba cortada abajo. Le saqué el sticky y ahora baja con la página y se ve entera.

Un test E2E fallaba porque Next agrega un aviso oculto que también usa role="alert"; corregí el selector del test, la app estaba bien.

Una edición masiva con sed cambió los saltos de línea de 7 archivos de lib/ que no tocaba. El contenido era idéntico, pero Git los marcaba como modificados. Los restauré antes de commitear y no entraron en ningún commit.

Los validadores de la skill no corren en Windows, así que armé un envoltorio que aplica exactamente sus mismas reglas. Quedó registrado como desvío en run-metadata.json.

Empecé a sacarle a es_admin() el permiso de ejecución para anónimos y lo quité antes de commitear. Las políticas de lectura pública podían llamarla y romper el catálogo, y además no tenía efecto real porque el permiso viene de PUBLIC.
---



Antes de mergear, verificá que el PR tenga todos los commits.

---

