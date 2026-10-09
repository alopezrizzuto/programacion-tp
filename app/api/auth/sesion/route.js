import { crearClienteServidor } from "@/lib/supabase/servidor";

// GET /api/auth/sesion: quién está conectado, para el header.
// Las páginas de la tienda son estáticas (iguales para todos), así que el navegador
// pregunta por la sesión acá en lugar de que cada página la lea en el servidor.
export async function GET() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ usuario: null });

  // RLS: cada usuario solo puede leer su propio perfil
  const { data: perfil } = await supabase.from("profiles").select("nombre, role").eq("id", user.id).single();

  return Response.json({
    usuario: { email: user.email, nombre: perfil?.nombre ?? "", role: perfil?.role ?? "cliente" },
  });
}
