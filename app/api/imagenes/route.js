import { exigirAdmin } from "@/lib/admin";
import { TAMANO_MAXIMO_IMAGEN, TIPOS_IMAGEN } from "@/lib/validacion-producto";

const EXTENSIONES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// POST /api/imagenes: sube una foto de producto a Supabase Storage y devuelve su dirección pública.
// Llega como FormData (el formato de los formularios con archivos), no como JSON.
export async function POST(request) {
  const admin = await exigirAdmin();
  if (admin.respuesta) return admin.respuesta;

  const archivo = (await request.formData().catch(() => null))?.get("archivo");
  if (!(archivo instanceof File)) return Response.json({ error: "Elegí una foto." }, { status: 400 });
  if (!TIPOS_IMAGEN.includes(archivo.type)) {
    return Response.json({ error: "La foto tiene que ser JPG, PNG o WebP." }, { status: 400 });
  }
  if (archivo.size > TAMANO_MAXIMO_IMAGEN) return Response.json({ error: "La foto puede pesar hasta 4 MB." }, { status: 400 });

  // Nombre al azar: dos fotos nunca se pisan y la dirección cambia si se reemplaza (no queda la vieja en caché)
  const ruta = `${crypto.randomUUID()}.${EXTENSIONES[archivo.type]}`;
  const almacen = admin.supabase.storage.from("productos");
  const { error } = await almacen.upload(ruta, archivo, { contentType: archivo.type, cacheControl: "31536000" });
  if (error) return Response.json({ error: "No se pudo subir la foto. Intentá de nuevo." }, { status: 500 });

  return Response.json({ url: almacen.getPublicUrl(ruta).data.publicUrl }, { status: 201 });
}
