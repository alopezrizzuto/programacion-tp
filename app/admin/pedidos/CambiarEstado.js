"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAMBIOS_ADMIN } from "@/lib/ordenes";

const ACCIONES = {
  pagada: "Confirmar pago",
  enviada: "Marcar como enviado",
  entregada: "Marcar como entregado",
  cancelada: "Cancelar pedido",
};

// Botones con los cambios de estado posibles para un pedido (según CAMBIOS_ADMIN)
export default function CambiarEstado({ orden }) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const posibles = CAMBIOS_ADMIN[orden.estado];
  if (posibles.length === 0) return null;

  async function cambiar(estado) {
    if (estado === "cancelada" && !window.confirm(`¿Cancelar el pedido ${orden.codigo}?`)) return;
    if (estado === "pagada" && !window.confirm(`¿Confirmar que llegó el pago de ${orden.codigo}? Se descuenta el stock.`)) return;
    setGuardando(true);
    setError("");
    try {
      const respuesta = await fetch(`/api/ordenes/${orden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!respuesta.ok) throw new Error((await respuesta.json()).error);
      router.refresh(); // vuelve a pedir la lista al servidor, con el estado nuevo
    } catch (falla) {
      setError(falla.message || "No se pudo cambiar el estado.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {posibles.map((estado) => (
          <button
            key={estado}
            type="button"
            disabled={guardando}
            onClick={() => cambiar(estado)}
            className={estado === "cancelada" ? "boton-secundario py-2 text-sm" : "boton py-2 text-sm"}
          >
            {ACCIONES[estado]}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-cereza">
          {error}
        </p>
      )}
    </div>
  );
}
