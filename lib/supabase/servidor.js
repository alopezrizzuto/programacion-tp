import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase que conoce al usuario: lee la sesión de las cookies del pedido.
// Se crea uno nuevo en cada pedido (nunca se comparte entre usuarios).
// Se usa en Route Handlers y en páginas del servidor (por ejemplo, /cuenta).
export async function crearClienteServidor() {
  const almacen = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      // Supabase guarda (o borra) la sesión en cookies al ingresar, salir o renovar el token.
      // En una página no se pueden escribir cookies: ahí la renovación la hace proxy.js.
      setAll(cookiesNuevas) {
        try {
          cookiesNuevas.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Llamado desde una página: se ignora, proxy.js ya renovó la sesión
        }
      },
    },
  });
}
