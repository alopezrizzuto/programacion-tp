// Controles comunes para las rutas que reciben pedidos del navegador (auditoría de seguridad).
//
// 1. Mismo origen: el navegador manda el encabezado Origin en los POST, PUT, PATCH y DELETE.
//    Si viene de otro sitio, se rechaza (403). Así otra página no puede, por ejemplo, enviar un
//    formulario oculto a /api/auth/ingresar y dejarte logueado en la cuenta de otro (login CSRF).
// 2. Solo JSON: un formulario HTML de otro sitio no puede mandar Content-Type application/json,
//    así que exigirlo cierra la otra puerta (415).
// 3. El cuerpo tiene que ser un objeto: null, un número o una lista se rechazan con 400
//    (antes podían hacer fallar la ruta con un 500).
// El webhook de Mercado Pago no usa esto: lo llama un servidor externo y se protege con su firma.

// ¿El pedido viene de otro sitio? Sin Origin (por ejemplo, curl o un test) se mira Sec-Fetch-Site.
export function origenAjeno(request) {
  const origen = request.headers.get("origin");
  if (origen) {
    try {
      return new URL(origen).host !== new URL(request.url).host;
    } catch {
      return true; // un Origin mal formado ("null", por ejemplo) no es nuestro sitio
    }
  }
  return request.headers.get("sec-fetch-site") === "cross-site";
}

const NO_PERMITIDO = () => Response.json({ error: "Pedido no permitido." }, { status: 403 });

// Para rutas sin cuerpo (cerrar sesión, borrar) o con archivos (FormData): solo el control de origen.
// Devuelve la respuesta de error o null si está todo bien.
export function rechazarOrigenAjeno(request) {
  return origenAjeno(request) ? NO_PERMITIDO() : null;
}

// Lee el cuerpo JSON con los tres controles. Devuelve { datos } o { respuesta } (el error listo para devolver).
export async function leerJson(request) {
  if (origenAjeno(request)) return { respuesta: NO_PERMITIDO() };
  const tipo = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!tipo.startsWith("application/json")) {
    return { respuesta: Response.json({ error: "El pedido tiene que enviarse como JSON." }, { status: 415 }) };
  }
  const datos = await request.json().catch(() => null);
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return { respuesta: Response.json({ error: "Los datos enviados no son válidos." }, { status: 400 }) };
  }
  return { datos };
}

// Id numérico de la URL (/api/variantes/12): entero y positivo, o null
export async function leerIdDeRuta(params) {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}
