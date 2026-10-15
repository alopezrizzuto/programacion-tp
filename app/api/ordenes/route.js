import { crearClienteServidor } from "@/lib/supabase/servidor";
import { crearClienteSecreto } from "@/lib/supabase/secreto";
import { obtenerProductos } from "@/lib/datos";
import { armarOrden, generarCodigo } from "@/lib/ordenes";
import { crearPreferencia } from "@/lib/mercadopago";
import { hayErrores } from "@/lib/auth";
import { normalizarCheckout, validarCheckout } from "@/lib/validacion-checkout";

// POST /api/ordenes: crea el pedido. Se puede comprar sin cuenta (con el email alcanza).
// Recibe { email, nombre, telefono, direccion, ciudad, provincia, codigoPostal, medioPago, items }
// y devuelve { codigo } (transferencia) o { codigo, linkPago } (Mercado Pago).
export async function POST(request) {
  const cuerpo = await request.json().catch(() => ({}));
  const datos = normalizarCheckout(cuerpo);
  const errores = validarCheckout(datos);
  if (hayErrores(errores)) return Response.json({ errores }, { status: 400 });

  // Precios, stock, descuentos y envío salen de la base, nunca del navegador
  const orden = armarOrden(cuerpo.items, await obtenerProductos(), datos.medioPago);
  if (orden.error) return Response.json({ error: orden.error }, { status: 409 });

  // Si hay sesión, el pedido queda asociado a la cuenta y aparece en "Mis pedidos"
  const {
    data: { user },
  } = await (await crearClienteServidor()).auth.getUser();

  const supabase = crearClienteSecreto();
  const { data: creada, error } = await supabase
    .from("ordenes")
    .insert({
      codigo: generarCodigo(),
      user_id: user?.id ?? null,
      email: datos.email,
      medio_pago: datos.medioPago,
      envio_nombre: datos.nombre,
      envio_telefono: datos.telefono,
      envio_direccion: datos.direccion,
      envio_ciudad: datos.ciudad,
      envio_provincia: datos.provincia,
      envio_codigo_postal: datos.codigoPostal,
      subtotal: orden.subtotal,
      descuento_bundles: orden.descuento_bundles,
      descuento_transferencia: orden.descuento_transferencia,
      costo_envio: orden.costo_envio,
      total: orden.total,
    })
    .select("id, codigo, email, total")
    .single();
  if (error) {
    console.error("No se pudo crear la orden:", error.message);
    return Response.json({ error: "No pudimos registrar tu pedido. Intentá de nuevo." }, { status: 500 });
  }

  const { error: errorItems } = await supabase
    .from("orden_items")
    .insert(orden.lineas.map((linea) => ({ ...linea, orden_id: creada.id })));
  if (errorItems) {
    // Una orden sin ítems quedaría a medias: se deshace
    await supabase.from("ordenes").delete().eq("id", creada.id);
    console.error("No se pudieron guardar los ítems:", errorItems.message);
    return Response.json({ error: "No pudimos registrar tu pedido. Intentá de nuevo." }, { status: 500 });
  }

  if (datos.medioPago === "transferencia") return Response.json({ codigo: creada.codigo }, { status: 201 });

  try {
    const preferencia = await crearPreferencia(creada, new URL(request.url).origin);
    await supabase.from("ordenes").update({ mp_preference_id: preferencia.id, mp_link: preferencia.link }).eq("id", creada.id);
    return Response.json({ codigo: creada.codigo, linkPago: preferencia.link }, { status: 201 });
  } catch (falla) {
    console.error(falla.message);
    await supabase.from("ordenes").update({ estado: "cancelada" }).eq("id", creada.id);
    return Response.json(
      { error: "No pudimos conectar con Mercado Pago. Probá de nuevo en unos minutos o elegí transferencia." },
      { status: 502 },
    );
  }
}
