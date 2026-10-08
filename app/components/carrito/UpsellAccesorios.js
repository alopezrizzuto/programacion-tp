"use client";

import { useState } from "react";
import ImagenProducto from "../ImagenProducto";
import { useCarrito } from "./ProveedorCarrito";
import { obtenerAccesorios } from "@/lib/accesorios";
import { formatearPrecio } from "@/lib/tienda";

// Sugerencias de accesorios dentro del carrito. Va en el flujo normal de la lista
// (no flota encima), así nunca tapa los productos, y se puede minimizar.
export default function UpsellAccesorios() {
  const { lineas, sumar } = useCarrito();
  const [desplegado, setDesplegado] = useState(true);
  const enCarrito = lineas.map((linea) => linea.producto.id);
  const sugeridos = obtenerAccesorios().filter((a) => !enCarrito.includes(a.id) && a.variantes[0].stock > 0);

  if (sugeridos.length === 0) return null;

  return (
    <section aria-labelledby="titulo-upsell" className="rounded-2xl bg-kraft/45">
      <h2 id="titulo-upsell">
        <button
          type="button"
          aria-expanded={desplegado}
          aria-controls="lista-upsell"
          onClick={() => setDesplegado(!desplegado)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold"
        >
          Completá tu pedido
          <span className="text-sm font-normal underline underline-offset-2">{desplegado ? "Ocultar" : "Ver sugerencias"}</span>
        </button>
      </h2>
      <ul id="lista-upsell" hidden={!desplegado} className="space-y-3 px-4 pb-4">
        {sugeridos.map((accesorio) => (
          <li key={accesorio.id} className="flex items-center gap-3">
            <div className="w-12 shrink-0 overflow-hidden rounded-lg">
              <ImagenProducto producto={accesorio} sizes="48px" miniatura />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{accesorio.nombre}</p>
              <p className="text-sm text-marron">{formatearPrecio(accesorio.variantes[0].precio)}</p>
            </div>
            <button
              type="button"
              onClick={() => sumar({ varianteId: accesorio.variantes[0].id })}
              aria-label={`Agregar ${accesorio.nombre} al carrito`}
              className="rounded-full border-[1.5px] border-tostado px-3 py-1.5 text-sm font-semibold hover:bg-tostado hover:text-crema"
            >
              Agregar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
