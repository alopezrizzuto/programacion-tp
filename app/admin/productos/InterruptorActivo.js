"use client";

import { useState } from "react";

// Interruptor "Visible en la tienda". Cambia al instante en pantalla (actualización optimista)
// y vuelve atrás si el servidor responde con error.
export default function InterruptorActivo({ producto }) {
  const [activo, setActivo] = useState(producto.activo);
  const [error, setError] = useState("");

  async function alternar() {
    const nuevo = !activo;
    setActivo(nuevo);
    setError("");
    try {
      const respuesta = await fetch(`/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevo }),
      });
      if (!respuesta.ok) throw new Error((await respuesta.json()).error);
    } catch (falla) {
      setActivo(!nuevo);
      setError(falla.message || "No se pudo cambiar.");
    }
  }

  return (
    <div>
      {/* role="switch": el lector de pantalla lo anuncia como interruptor, con su estado */}
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={`${producto.nombre} visible en la tienda`}
        onClick={alternar}
        className="flex items-center gap-3"
      >
        <span className={`relative h-6 w-11 rounded-full transition-colors ${activo ? "bg-tostado" : "bg-marron/30"}`}>
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-crema shadow transition-[left] ${activo ? "left-[1.375rem]" : "left-0.5"}`}
          />
        </span>
        <span className="text-sm">{activo ? "Visible" : "Oculto"}</span>
      </button>
      {error && (
        <p role="alert" className="mt-1 text-sm text-cereza">
          {error}
        </p>
      )}
    </div>
  );
}
