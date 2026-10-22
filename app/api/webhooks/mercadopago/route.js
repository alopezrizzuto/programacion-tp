import { crearClienteSecreto } from "@/lib/supabase/secreto";
import { firmaValida, obtenerPago } from "@/lib/mercadopago";
import { revalidarTienda } from "@/lib/admin";

const LISTO = () => new Response(null, { status: 200 });

// POST /api/webhooks/mercadopago: Mercado Pago avisa acá cuando un pago cambia.
// El aviso trae solo el id del pago (?data.id=...&type=payment). Pasos:
// 1. verificar la firma (que venga de Mercado Pago), 2. pedirle el pago a Mercado Pago,
// 3. actualizar el pedido. Responder 200 le dice "recibido"; con otro código, lo vuelve a mandar.
export async function POST(request) {
  const url = new URL(request.url);
  const cuerpo = await request.json().catch(() => ({}));
  const tipo = url.searchParams.get("type") ?? cuerpo.type;
  const idPago = url.searchParams.get("data.id") ?? cuerpo.data?.id;

  // Solo interesan los avisos de pagos; el resto se da por recibido para que no se reintente
  if (tipo !== "payment" || !idPago) return LISTO();

  const valida = firmaValida({
    firma: request.headers.get("x-signature"),
    idAviso: request.headers.get("x-request-id"),
    idPago,
    secreto: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  });
  if (!valida) {
    // Diagnóstico temporal: qué mandó Mercado Pago, para ver por qué no coincide la firma.
    // Nada de esto es secreto: la firma solo sirve para este aviso y no permite deducir la clave.
    console.warn(
      "Webhook con firma inválida:",
      JSON.stringify({
        consulta: url.search,
        idAviso: request.headers.get("x-request-id"),
        firma: request.headers.get("x-signature"),
        claveCargada: Boolean(process.env.MERCADOPAGO_WEBHOOK_SECRET),
        cuerpo,
      }),
    );
    return Response.json({ error: "Firma inválida." }, { status: 401 });
  }

  let pago;
  try {
    pago = await obtenerPago(idPago);
  } catch (falla) {
    console.error(falla.message);
    return Response.json({ error: "No se pudo consultar el pago." }, { status: 502 }); // que lo reintente
  }
  if (!pago?.external_reference) return LISTO();

  const supabase = crearClienteSecreto();
  const { data: orden } = await supabase
    .from("ordenes")
    .select("id, estado, total")
    .eq("codigo", pago.external_reference)
    .maybeSingle();
  if (!orden) return LISTO(); // no es un pedido nuestro

  if (pago.status === "approved") {
    // Si el monto cobrado no coincide con el pedido, no se confirma (alguien pudo alterar el pago)
    if (Math.round(pago.transaction_amount) !== orden.total) {
      console.error(`Pago ${pago.id}: cobró ${pago.transaction_amount} y el pedido ${pago.external_reference} es de ${orden.total}`);
      return LISTO();
    }
    // Pagado + stock descontado, en una sola transacción (función de la migración 004)
    const { data: confirmado, error } = await supabase.rpc("confirmar_pago", {
      p_orden_id: orden.id,
      p_payment_id: String(pago.id),
    });
    if (error) {
      console.error("confirmar_pago:", error.message);
      return Response.json({ error: "No se pudo confirmar." }, { status: 500 });
    }
    if (confirmado) revalidarTienda(); // cambió el stock: la tienda se regenera
  } else if (["rejected", "cancelled"].includes(pago.status)) {
    // Solo si seguía pendiente: un aviso viejo de rechazo no pisa un pago aprobado después
    await supabase
      .from("ordenes")
      .update({ estado: "rechazada", mp_payment_id: String(pago.id) })
      .eq("id", orden.id)
      .eq("estado", "pendiente");
  }
  // "pending" o "in_process" (por ejemplo, pago en efectivo): el pedido sigue pendiente

  return LISTO();
}
