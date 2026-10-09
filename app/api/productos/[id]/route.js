import { exigirAdmin, respuestaErrorBase, revalidarTienda } from "@/lib/admin";
import { hayErrores } from "@/lib/auth";
import { normalizarProducto, validarProducto } from "@/lib/validacion-producto";

const NO_EXISTE = () => Response.json({ error: "Ese producto no existe." }, { status: 404 });

// En Next 16 los params llegan como promesa
async function leerId(params) {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PUT /api/productos/:id: reemplaza los datos del producto y sincroniza sus variantes
// (actualiza las que siguen, crea las nuevas y borra las que se quitaron)
export async function PUT(request, { params }) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;
  const id = await leerId(params);
  if (!id) return NO_EXISTE();

  const { supabase } = admin;
  const { data: existente } = await supabase.from("productos").select("categoria, variantes(id)").eq("id", id).maybeSingle();
  if (!existente) return NO_EXISTE();

  // La categoría no se cambia al editar: un café no se convierte en accesorio
  const producto = normalizarProducto({ ...(await request.json().catch(() => ({}))), categoria: existente.categoria });
  const errores = validarProducto(producto);
  if (hayErrores(errores)) return Response.json({ errores }, { status: 400 });

  const { variantes, ...datos } = producto;
  const idsActuales = existente.variantes.map((variante) => variante.id);
  const siguen = variantes.filter((variante) => idsActuales.includes(variante.id));
  const nuevas = variantes.filter((variante) => !idsActuales.includes(variante.id));
  const quitadas = idsActuales.filter((idVariante) => !siguen.some((variante) => variante.id === idVariante));

  // Primero lo que más puede fallar: una variante con pedidos no se puede borrar
  if (quitadas.length > 0) {
    const { error } = await supabase.from("variantes").delete().in("id", quitadas);
    if (error) return respuestaErrorBase(error);
  }

  const { error } = await supabase.from("productos").update(datos).eq("id", id);
  if (error) return respuestaErrorBase(error);

  for (const { id: idVariante, ...variante } of siguen) {
    const { error: errorVariante } = await supabase.from("variantes").update(variante).eq("id", idVariante);
    if (errorVariante) return respuestaErrorBase(errorVariante);
  }

  if (nuevas.length > 0) {
    const { error: errorNuevas } = await supabase
      .from("variantes")
      .insert(nuevas.map(({ id: _id, ...variante }) => ({ ...variante, producto_id: id })));
    if (errorNuevas) return respuestaErrorBase(errorNuevas);
  }

  revalidarTienda();
  return Response.json({ id });
}

// PATCH /api/productos/:id: cambio rápido desde la lista (por ahora, activar o desactivar)
export async function PATCH(request, { params }) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;
  const id = await leerId(params);
  if (!id) return NO_EXISTE();

  const { activo } = await request.json().catch(() => ({}));
  if (typeof activo !== "boolean") return Response.json({ error: "Falta indicar si está activo." }, { status: 400 });

  const { data, error } = await admin.supabase.from("productos").update({ activo }).eq("id", id).select("id, activo").maybeSingle();
  if (error) return respuestaErrorBase(error);
  if (!data) return NO_EXISTE();

  revalidarTienda();
  return Response.json(data);
}

// DELETE /api/productos/:id: borra el producto con sus variantes y reseñas.
// Si ya tiene pedidos, la base no lo permite (se avisa que conviene desactivarlo).
export async function DELETE(request, { params }) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;
  const id = await leerId(params);
  if (!id) return NO_EXISTE();

  const { data, error } = await admin.supabase.from("productos").delete().eq("id", id).select("id");
  if (error) return respuestaErrorBase(error);
  if (data.length === 0) return NO_EXISTE();

  revalidarTienda();
  return new Response(null, { status: 204 });
}
