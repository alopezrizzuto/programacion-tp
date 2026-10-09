"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BotonEliminar({ producto }) {
  const router = useRouter();
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState("");

  async function borrar() {
    // confirm(): ventana nativa del navegador para no borrar por error
    if (!window.confirm(`¿Borrar "${producto.nombre}"? No se puede deshacer.`)) return;
    setBorrando(true);
    setError("");
    try {
      const respuesta = await fetch(`/api/productos/${producto.id}`, { method: "DELETE" });
      if (!respuesta.ok) throw new Error((await respuesta.json()).error);
      router.push(`/admin/productos?borrado=${encodeURIComponent(producto.nombre)}`);
      router.refresh();
    } catch (falla) {
      setError(falla.message || "No se pudo borrar.");
      setBorrando(false);
    }
  }

  return (
    <div className="mt-5">
      <button type="button" onClick={borrar} disabled={borrando} className="boton bg-cereza hover:bg-cereza/90">
        {borrando ? "Borrando…" : "Borrar producto"}
      </button>
      {error && (
        <p role="alert" className="mt-3 font-semibold text-cereza">
          {error}
        </p>
      )}
    </div>
  );
}
