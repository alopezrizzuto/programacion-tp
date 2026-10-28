"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Botón para marcar un mensaje como leído (o volver a dejarlo sin leer)
export default function MarcarLeido({ mensaje }) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cambiar() {
    setGuardando(true);
    setError("");
    try {
      const respuesta = await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: !mensaje.leido }),
      });
      if (!respuesta.ok) throw new Error((await respuesta.json()).error);
      router.refresh(); // vuelve a pedir la lista al servidor
    } catch (falla) {
      setError(falla.message || "No se pudo cambiar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={cambiar} disabled={guardando} className="boton-secundario py-2 text-sm">
        {mensaje.leido ? "Marcar como no leído" : "Marcar como leído"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-cereza">
          {error}
        </p>
      )}
    </div>
  );
}
