import { crearClienteSecreto } from "@/lib/supabase/secreto";
import { hayErrores } from "@/lib/auth";
import { normalizarContacto, validarContacto } from "@/lib/validacion-contacto";

// POST /api/contacto: guarda un mensaje del formulario de contacto.
// Recibe { nombre, email, motivo, mensaje } y devuelve { ok: true } o los errores por campo.
export async function POST(request) {
  const datos = normalizarContacto(await request.json().catch(() => ({})));

  // Campo trampa completo: es un bot. Se responde como si estuviera todo bien, pero no se guarda.
  if (datos.sitio) return Response.json({ ok: true }, { status: 201 });

  const errores = validarContacto(datos);
  if (hayErrores(errores)) return Response.json({ errores }, { status: 400 });

  const { nombre, email, motivo, mensaje } = datos;
  const { error } = await crearClienteSecreto().from("mensajes").insert({ nombre, email, motivo, mensaje });
  if (error) {
    console.error("No se pudo guardar el mensaje:", error.message);
    return Response.json({ error: "No pudimos enviar tu mensaje. Probá de nuevo en unos minutos." }, { status: 500 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
