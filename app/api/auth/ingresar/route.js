import { crearClienteServidor } from "@/lib/supabase/servidor";
import { hayErrores, normalizar, traducirErrorAuth, validarIngreso } from "@/lib/auth";

// POST /api/auth/ingresar: inicia la sesión. Supabase la guarda en cookies de la respuesta.
export async function POST(request) {
  const datos = normalizar(await request.json().catch(() => ({})));
  const errores = validarIngreso(datos);
  if (hayErrores(errores)) return Response.json({ errores }, { status: 400 });

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: datos.email, password: datos.password });
  if (error) {
    // Mismo mensaje si el email no existe o si la contraseña está mal: no revela qué cuentas existen
    const status = error.code === "invalid_credentials" ? 401 : (error.status ?? 400);
    return Response.json({ error: traducirErrorAuth(error) }, { status });
  }

  return Response.json({ ok: true });
}
