import { exigirAdmin, respuestaErrorBase, revalidarTienda } from "@/lib/admin";
import { crearClienteSecreto } from "@/lib/supabase/secreto";
import { CAMBIOS_ADMIN, ESTADOS } from "@/lib/ordenes";

// PATCH /api/ordenes/:id: el admin cambia el estado de un pedido (solo admin).
// Ejemplos: confirmar una transferencia (pendiente → pagada), despacharlo (pagada → enviada).
export async function PATCH(request, { params }) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;

  const id = Number((await params).id);
  const { estado } = await request.json().catch(() => ({}));
  if (!ESTADOS[estado]) return Response.json({ error: "Ese estado no existe." }, { status: 400 });

  const { data: orden } = await admin.supabase.from("ordenes").select("id, estado").eq("id", id).maybeSingle();
  if (!orden) return Response.json({ error: "Ese pedido no existe." }, { status: 404 });
  if (!CAMBIOS_ADMIN[orden.estado].includes(estado)) {
    return Response.json(
      { error: `Un pedido "${ESTADOS[orden.estado].nombre}" no puede pasar a "${ESTADOS[estado].nombre}".` },
      { status: 409 },
    );
  }

  if (estado === "pagada") {
    // Confirmar el pago descuenta el stock: misma función que usa el webhook
    const { data: confirmado, error } = await crearClienteSecreto().rpc("confirmar_pago", { p_orden_id: id, p_payment_id: null });
    if (error) return respuestaErrorBase(error);
    if (!confirmado) return Response.json({ error: "El pedido cambió mientras tanto. Recargá la página." }, { status: 409 });
    revalidarTienda();
  } else {
    // .eq("estado", ...): si otro cambio llegó antes, no se pisa (no actualiza ninguna fila)
    const { data, error } = await admin.supabase
      .from("ordenes")
      .update({ estado })
      .eq("id", id)
      .eq("estado", orden.estado)
      .select("id");
    if (error) return respuestaErrorBase(error);
    if (data.length === 0) return Response.json({ error: "El pedido cambió mientras tanto. Recargá la página." }, { status: 409 });
  }

  return Response.json({ id, estado });
}
