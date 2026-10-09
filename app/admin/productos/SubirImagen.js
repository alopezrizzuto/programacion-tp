"use client";

import { useState } from "react";
import Image from "next/image";
import { TAMANO_MAXIMO_IMAGEN, TIPOS_IMAGEN } from "@/lib/validacion-producto";

// Elegir una foto la sube enseguida a Supabase Storage (vía /api/imagenes)
// y el formulario se queda con su dirección, que se guarda al apretar "Guardar".
export default function SubirImagen({ url, alCambiar, error }) {
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState("");
  const mensaje = errorSubida || error;

  async function alElegir(evento) {
    const archivo = evento.target.files[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    // Se chequea antes de subir, para no esperar una subida que va a fallar
    if (!TIPOS_IMAGEN.includes(archivo.type)) return setErrorSubida("La foto tiene que ser JPG, PNG o WebP.");
    if (archivo.size > TAMANO_MAXIMO_IMAGEN) return setErrorSubida("La foto puede pesar hasta 4 MB.");

    setErrorSubida("");
    setSubiendo(true);
    try {
      const datos = new FormData();
      datos.append("archivo", archivo);
      const respuesta = await fetch("/api/imagenes", { method: "POST", body: datos });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.error);
      alCambiar(resultado.url);
    } catch (falla) {
      setErrorSubida(falla.message || "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold" id="foto-etiqueta">
        Foto del producto
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-5">
        <div className="relative grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-2xl bg-kraft text-center text-sm text-marron">
          {url ? <Image src={url} alt="Foto actual del producto" fill sizes="128px" className="object-cover" /> : "Sin foto"}
        </div>
        <div className="space-y-3">
          <input
            id="imagen_url"
            name="imagen_url"
            type="file"
            accept={TIPOS_IMAGEN.join(",")}
            onChange={alElegir}
            disabled={subiendo}
            aria-labelledby="foto-etiqueta"
            aria-describedby="foto-ayuda"
            aria-invalid={mensaje ? true : undefined}
            className="block text-sm file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-tostado file:px-4 file:py-2 file:font-semibold file:text-crema"
          />
          {url && (
            <button type="button" onClick={() => alCambiar(null)} className="text-sm font-semibold underline">
              Quitar foto
            </button>
          )}
        </div>
      </div>
      <p id="foto-ayuda" aria-live="polite" className={`mt-2 text-sm ${mensaje ? "font-semibold text-cereza" : "text-marron"}`}>
        {subiendo ? "Subiendo foto…" : mensaje || "Cuadrada, 1200 × 1200 px, JPG, PNG o WebP de hasta 4 MB."}
      </p>
    </div>
  );
}
