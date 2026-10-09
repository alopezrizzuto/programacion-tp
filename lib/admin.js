import { cache } from "react";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { crearClienteServidor } from "./supabase/servidor";

// ¿Quién pide y es admin? Devuelve un estado HTTP:
// 401 si no hay sesión, 403 si hay sesión pero no es admin, 200 si es admin (con su cliente de Supabase).
// cache(): el layout y la página de /admin lo piden en la misma visita y se consulta una sola vez.
export const obtenerAdmin = cache(async () => {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { estado: 401 };

  const { data: perfil } = await supabase.from("profiles").select("nombre, role").eq("id", user.id).single();
  if (perfil?.role !== "admin") return { estado: 403 };

  return { estado: 200, supabase, usuario: user, perfil };
});

// Para las páginas de /admin: sin sesión, a ingresar; si no es admin, 404 (ni se entera de que existe).
// Devuelve el cliente de Supabase del admin para leer los datos.
export async function adminDePagina() {
  const admin = await obtenerAdmin();
  if (admin.estado === 401) redirect("/ingresar?siguiente=/admin");
  if (admin.estado === 403) notFound();
  return admin.supabase;
}

// Para los Route Handlers: si no es admin, la respuesta de error lista para devolver.
// Igual, aunque alguien saltee esto, RLS en la base no lo deja modificar nada.
export async function exigirAdmin() {
  const admin = await obtenerAdmin();
  if (admin.estado === 401) return { respuesta: Response.json({ error: "Tenés que ingresar." }, { status: 401 }) };
  if (admin.estado === 403) {
    return { respuesta: Response.json({ error: "Solo un administrador puede hacer esto." }, { status: 403 }) };
  }
  return admin;
}

// Después de cambiar el catálogo: vuelve a generar todas las páginas de la tienda
// (el layout lee el catálogo para el carrito, así que se invalida desde la raíz).
export function revalidarTienda() {
  revalidatePath("/", "layout");
}

// Pasa un error de Postgres a una respuesta clara para el panel
export function respuestaErrorBase(error) {
  switch (error.code) {
    case "23505": // unique_violation
      return Response.json({ errores: { slug: "Ya hay un producto con esa dirección. Elegí otra." } }, { status: 409 });
    case "23503": // foreign_key_violation
      return Response.json(
        { error: "Ya hay pedidos con este producto o variante: no se puede borrar. Podés desactivarlo o dejarlo sin stock." },
        { status: 409 },
      );
    case "23514": // check_violation
      return Response.json({ error: "Algún dato no cumple las reglas de la base. Revisá el formulario." }, { status: 400 });
    default:
      return Response.json({ error: "No se pudo guardar. Intentá de nuevo." }, { status: 500 });
  }
}
