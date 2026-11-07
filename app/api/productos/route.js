import { exigirAdmin, respuestaErrorBase, revalidarTienda } from "@/lib/admin";
import { hayErrores } from "@/lib/auth";
import { filtrarProductos, leerFiltros, paisesDeOrigen } from "@/lib/catalogo";
import { obtenerProductos } from "@/lib/datos";
import { normalizarProducto, validarProducto } from "@/lib/validacion-producto";

// GET /api/productos: catálogo público con búsqueda y filtros (los mismos que la página /productos).
// Ejemplo: /api/productos?perfil=frutal&peso=250&precioMax=25000&stock=1
// Responde 400 con un mensaje por campo si algún filtro no es válido.
export async function GET(request) {
  const productos = await obtenerProductos();
  const { filtros, errores } = leerFiltros(new URL(request.url).searchParams, { paises: paisesDeOrigen(productos) });
  if (hayErrores(errores)) return Response.json({ errores }, { status: 400 });

  // Las reseñas no van en el listado: se ven en la página de cada producto
  const encontrados = filtrarProductos(productos, filtros).map(({ resenas: _resenas, ...producto }) => producto);
  return Response.json({ total: encontrados.length, filtros, productos: encontrados });
}

// POST /api/productos: crea un producto con sus variantes (solo admin)
export async function POST(request) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;

  const producto = normalizarProducto(await request.json().catch(() => ({})));
  const errores = validarProducto(producto);
  if (hayErrores(errores)) return Response.json({ errores }, { status: 400 });

  const { variantes, ...datos } = producto;
  const { data: creado, error } = await admin.supabase.from("productos").insert(datos).select("id").single();
  if (error) return respuestaErrorBase(error);

  const { error: errorVariantes } = await admin.supabase
    .from("variantes")
    .insert(variantes.map(({ id: _id, ...variante }) => ({ ...variante, producto_id: creado.id })));
  if (errorVariantes) {
    // Un producto sin variantes quedaría a medias: se deshace la creación
    await admin.supabase.from("productos").delete().eq("id", creado.id);
    return respuestaErrorBase(errorVariantes);
  }

  revalidarTienda();
  return Response.json({ id: creado.id }, { status: 201 });
}
