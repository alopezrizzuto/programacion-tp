import { crearClienteServidor } from "@/lib/supabase/servidor";

// POST /api/auth/salir: cierra la sesión y borra las cookies.
// Es POST (no GET) para que un link o una imagen de otro sitio no pueda cerrarte la sesión.
export async function POST() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  return Response.json({ ok: true });
}
