import { rechazarOrigenAjeno } from "@/lib/peticion";
import { crearClienteServidor } from "@/lib/supabase/servidor";

// POST /api/auth/salir: cierra la sesión y borra las cookies.
// Es POST (no GET) para que un link o una imagen de otro sitio no pueda cerrarte la sesión.
export async function POST(request) {
  const rechazo = rechazarOrigenAjeno(request);
  if (rechazo) return rechazo;
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signOut();
  // Si Supabase no pudo revocar la sesión, se avisa en vez de responder que salió bien
  if (error) return Response.json({ error: "No pudimos cerrar la sesión. Probá de nuevo." }, { status: 502 });
  return Response.json({ ok: true });
}
