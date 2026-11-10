import { leerIdDeRuta, leerJson } from "@/lib/peticion";
import { exigirAdmin, respuestaErrorBase } from "@/lib/admin";

// PATCH /api/mensajes/:id: el admin marca un mensaje como leído o no leído ({ leido: true | false })
export async function PATCH(request, { params }) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;

  const id = await leerIdDeRuta(params);
  if (!id) return Response.json({ error: "Ese mensaje no existe." }, { status: 404 });
  const lectura = await leerJson(request);
  if (lectura.respuesta) return lectura.respuesta;
  const { leido } = lectura.datos;
  if (typeof leido !== "boolean") return Response.json({ error: "Falta indicar si está leído." }, { status: 400 });

  const { data, error } = await admin.supabase.from("mensajes").update({ leido }).eq("id", id).select("id, leido").maybeSingle();
  if (error) return respuestaErrorBase(error);
  if (!data) return Response.json({ error: "Ese mensaje no existe." }, { status: 404 });
  return Response.json(data);
}
