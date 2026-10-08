// Lectura del catálogo desde Supabase. Se usa en Server Components (páginas y layout).
// Para leer el catálogo público no hace falta la sesión del usuario: se usa la clave pública
// y RLS deja ver solo los productos activos.

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

// cache(): si en una misma carga de página varios componentes piden el catálogo,
// la consulta a Supabase se hace una sola vez.
export const obtenerProductos = cache(async () => {
  const { data, error } = await supabase
    .from("productos")
    .select("*, variantes(*), resenas(*)")
    .eq("activo", true)
    .order("id")
    .order("peso_gramos", { referencedTable: "variantes", nullsFirst: false })
    .order("id", { referencedTable: "resenas" });

  if (error) throw new Error(`No se pudo leer el catálogo de Supabase: ${error.message}`);
  // Un producto sin variantes no se puede comprar: no se muestra en la tienda
  return data.filter((producto) => producto.variantes.length > 0);
});

export async function obtenerCafes() {
  return (await obtenerProductos()).filter((producto) => producto.categoria === "cafe");
}

export async function obtenerAccesorios() {
  return (await obtenerProductos()).filter((producto) => producto.categoria === "accesorio");
}

export async function obtenerProductoPorSlug(categoria, slug) {
  return (await obtenerProductos()).find((producto) => producto.categoria === categoria && producto.slug === slug);
}
