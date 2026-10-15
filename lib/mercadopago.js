import { createHmac, timingSafeEqual } from "node:crypto";

// Conexión con la API de Mercado Pago, con fetch (sin su librería: son dos pedidos HTTP).
// Solo se usa en el servidor: el Access Token es secreto.
const API = "https://api.mercadopago.com";

function encabezados() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) throw new Error("Falta la variable MERCADOPAGO_ACCESS_TOKEN.");
  return { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`, "Content-Type": "application/json" };
}

// Crea la "preferencia" de Checkout Pro: qué se cobra y a dónde vuelve la persona después.
// Se cobra el pedido como un solo ítem por el total ya calculado (con descuentos y envío),
// así lo que cobra Mercado Pago coincide exacto con la orden guardada.
// Devuelve { id, link } o lanza un error.
export async function crearPreferencia(orden, origen) {
  const volver = `${origen}/seguimiento/${orden.codigo}`;
  // Mercado Pago solo acepta volver solo y avisar a direcciones públicas con https (no a localhost)
  const publica = origen.startsWith("https://");

  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: { ...encabezados(), "X-Idempotency-Key": orden.codigo },
    body: JSON.stringify({
      items: [
        {
          id: orden.codigo,
          title: `Pedido ${orden.codigo} en Origen Café`,
          quantity: 1,
          unit_price: orden.total,
          currency_id: "ARS",
        },
      ],
      payer: { email: orden.email },
      external_reference: orden.codigo, // con esto el webhook sabe a qué pedido corresponde el pago
      back_urls: { success: `${volver}?pago=aprobado`, pending: `${volver}?pago=pendiente`, failure: `${volver}?pago=rechazado` },
      ...(publica && { auto_return: "approved", notification_url: `${origen}/api/webhooks/mercadopago` }),
      statement_descriptor: "ORIGEN CAFE",
    }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(`Mercado Pago rechazó la preferencia: ${datos.message ?? respuesta.status}`);
  return { id: datos.id, link: datos.init_point };
}

// Pide a Mercado Pago los datos reales de un pago. El webhook solo trae el id:
// el estado y el monto se leen siempre de acá, nunca del aviso (que podría ser falso).
export async function obtenerPago(id) {
  const respuesta = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, { headers: encabezados() });
  if (respuesta.status === 404) return null;
  if (!respuesta.ok) throw new Error(`No se pudo consultar el pago ${id} (${respuesta.status})`);
  return respuesta.json();
}

// Verifica que el aviso venga de Mercado Pago. El encabezado x-signature trae "ts=...,v1=...":
// v1 es una firma HMAC-SHA256 que solo puede calcular quien conoce la clave secreta del webhook.
// Se arma el mismo texto que firmó Mercado Pago y se compara el resultado.
export function firmaValida({ firma, idAviso, idPago, secreto }) {
  if (!firma || !secreto) return false;
  const partes = Object.fromEntries(firma.split(",").map((parte) => parte.trim().split("=", 2)));
  if (!partes.ts || !partes.v1) return false;

  let manifiesto = "";
  if (idPago) manifiesto += `id:${String(idPago).toLowerCase()};`;
  if (idAviso) manifiesto += `request-id:${idAviso};`; // x-request-id: el id de este aviso
  manifiesto += `ts:${partes.ts};`;

  const esperada = Buffer.from(createHmac("sha256", secreto).update(manifiesto).digest("hex"));
  const recibida = Buffer.from(partes.v1);
  // timingSafeEqual compara sin cortar antes: no deja adivinar la firma midiendo tiempos
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
