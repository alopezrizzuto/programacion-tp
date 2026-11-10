import { leerIdDeRuta, leerJson } from "@/lib/peticion";
import { exigirAdmin, respuestaErrorBase, revalidarTienda } from "@/lib/admin";

// PATCH /api/variantes/:id: actualiza el stock de una variante (lo usa la lista del panel)
export async function PATCH(request, { params }) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;

  const id = await leerIdDeRuta(params);
  if (!id) return Response.json({ error: "Esa variante no existe." }, { status: 404 });
  const lectura = await leerJson(request);
  if (lectura.respuesta) return lectura.respuesta;
  const { stock } = lectura.datos;
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
    return Response.json({ errores: { stock: "El stock tiene que ser un número entero, 0 o más." } }, { status: 400 });
  }

  const { data, error } = await admin.supabase.from("variantes").update({ stock }).eq("id", id).select("id, stock").maybeSingle();
  if (error) return respuestaErrorBase(error);
  if (!data) return Response.json({ error: "Esa variante no existe." }, { status: 404 });

  revalidarTienda();
  return Response.json(data);
}
