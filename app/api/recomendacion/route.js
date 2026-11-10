import { leerJson } from "@/lib/peticion";
import { obtenerCafes } from "@/lib/datos";
import { recomendar, validarRespuestas } from "@/lib/recomendacion";

// POST /api/recomendacion: el test "Elegí tu café ideal".
// Recibe { intensidad, acidez, leche, metodo } y devuelve { resultados }: los 3 cafés que mejor encajan,
// cada uno con su % de coincidencia, los motivos y la molienda sugerida.
// Responde 400 con { error } si falta una respuesta o alguna no es una de las opciones.
export async function POST(request) {
  const lectura = await leerJson(request);
  if (lectura.respuesta) return lectura.respuesta;
  const respuestas = lectura.datos;
  const problema = validarRespuestas(respuestas);
  if (problema) return Response.json({ error: problema }, { status: 400 });

  try {
    // Solo se recomiendan cafés que se pueden comprar (con stock en algún peso)
    const cafes = (await obtenerCafes()).filter((cafe) => cafe.variantes.some((variante) => variante.stock > 0));
    const resultados = recomendar(respuestas, cafes).map(({ cafe: { resenas: _resenas, ...cafe }, puntaje: _puntaje, ...resto }) => ({
      cafe,
      ...resto,
    }));
    return Response.json({ resultados });
  } catch (error) {
    console.error("No se pudo calcular la recomendación:", error.message);
    return Response.json({ error: "No pudimos calcular tu café. Probá de nuevo en unos minutos." }, { status: 500 });
  }
}
