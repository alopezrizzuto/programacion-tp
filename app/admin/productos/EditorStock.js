"use client";

import { useState } from "react";

// Stock de una variante, editable desde la lista. El botón "Guardar" aparece solo si cambió.
export default function EditorStock({ variante }) {
  const [guardado, setGuardado] = useState(variante.stock);
  const [valor, setValor] = useState(String(variante.stock));
  const [estado, setEstado] = useState(""); // "", "guardando", "listo" o un mensaje de error
  const id = `stock-${variante.id}`;
  const cambio = valor !== String(guardado);

  async function guardar(evento) {
    evento.preventDefault();
    const stock = Number(valor);
    if (valor === "" || !Number.isInteger(stock) || stock < 0) {
      setEstado("Tiene que ser un número entero, 0 o más.");
      return;
    }
    setEstado("guardando");
    try {
      const respuesta = await fetch(`/api/variantes/${variante.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.errores?.stock ?? resultado.error);
      setGuardado(resultado.stock);
      setEstado("listo");
    } catch (error) {
      setEstado(error.message || "No se pudo guardar.");
    }
  }

  const mensaje = { guardando: "Guardando…", listo: "Guardado" }[estado] ?? estado;

  return (
    <form onSubmit={guardar} className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <label htmlFor={id} className="w-14 text-sm">
        {variante.nombre}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        value={valor}
        onChange={(evento) => {
          setValor(evento.target.value);
          setEstado("");
        }}
        aria-describedby={`${id}-estado`}
        className={`w-20 rounded-lg border bg-crema px-2 py-1.5 tabular-nums ${
          guardado === 0 ? "border-cereza" : "border-marron/40"
        }`}
      />
      {cambio && (
        <button type="submit" disabled={estado === "guardando"} className="rounded-full bg-tostado px-3 py-1.5 text-sm font-semibold text-crema">
          Guardar
        </button>
      )}
      <span
        id={`${id}-estado`}
        aria-live="polite"
        className={`text-sm ${estado && estado !== "guardando" && estado !== "listo" ? "text-cereza" : "text-marron"}`}
      >
        {mensaje}
      </span>
    </form>
  );
}
