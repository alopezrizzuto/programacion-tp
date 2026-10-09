import { crearClienteServidor } from "@/lib/supabase/servidor";
import { hayErrores, normalizar, traducirErrorAuth, validarRegistro } from "@/lib/auth";

// POST /api/auth/registro: crea la cuenta y deja la sesión iniciada.
// Vuelve a validar todo: lo que llega del navegador puede venir modificado.
export async function POST(request) {
  const datos = normalizar(await request.json().catch(() => ({})));
  const errores = validarRegistro(datos);
  if (hayErrores(errores)) return Response.json({ errores }, { status: 400 });

  const supabase = await crearClienteServidor();
  // El nombre viaja como dato del usuario; el trigger crear_perfil lo copia a profiles
  const { error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: { data: { nombre: datos.nombre } },
  });
  if (error) return Response.json({ error: traducirErrorAuth(error) }, { status: error.status ?? 400 });

  return Response.json({ ok: true }, { status: 201 });
}
