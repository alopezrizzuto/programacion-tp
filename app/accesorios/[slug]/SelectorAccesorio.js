"use client";

import { useState } from "react";
import BarraEnvioGratis from "../../components/BarraEnvioGratis";
import { useCarrito } from "../../components/carrito/ProveedorCarrito";
import { PROMOS, STOCK_BAJO, formatearPrecio, precioTransferencia, valorCuota } from "@/lib/tienda";

// Versión simple de la columna de compra: los accesorios tienen una sola variante,
// no llevan molienda ni bundles. Solo se elige la cantidad.
export default function SelectorAccesorio({ accesorio }) {
  const variante = accesorio.variantes[0];
  const hayStock = variante.stock > 0;
  const [cantidad, setCantidad] = useState(1);
  const total = variante.precio * cantidad;

  const { agregar } = useCarrito();

  function agregarAlCarrito(evento) {
    evento.preventDefault();
    agregar({ varianteId: variante.id, cantidad });
  }

  function cambiarCantidad(nueva) {
    setCantidad(Math.max(1, Math.min(nueva, variante.stock)));
  }

  return (
    <form className="mt-8 space-y-8" onSubmit={agregarAlCarrito}>
      <p className={`flex items-center gap-2 font-semibold ${hayStock && variante.stock <= STOCK_BAJO ? "text-cereza" : ""}`}>
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-current" />
        {!hayStock
          ? "Sin stock"
          : variante.stock <= STOCK_BAJO
            ? `Quedan solo ${variante.stock} ${variante.stock === 1 ? "unidad" : "unidades"}`
            : "En stock, listo para despachar"}
      </p>

      <div aria-live="polite" className="rounded-3xl bg-tostado p-6 text-crema">
        <p className="font-display text-4xl tabular-nums">{formatearPrecio(total)}</p>
        <p className="mt-2">
          <strong className="font-semibold">{formatearPrecio(precioTransferencia(total))}</strong> pagando por
          transferencia ({PROMOS.descuentoTransferencia}% OFF)
        </p>
        <p className="text-kraft">
          o {PROMOS.cuotasSinInteres} cuotas sin interés de {formatearPrecio(valorCuota(total))}
        </p>

        <div className="mt-6 flex gap-3">
          <div className="flex items-center rounded-full border-[1.5px] border-kraft/60">
            <button
              type="button"
              onClick={() => cambiarCantidad(cantidad - 1)}
              disabled={!hayStock || cantidad <= 1}
              aria-label="Restar una unidad"
              className="grid h-12 w-11 place-items-center text-xl disabled:opacity-40"
            >
              −
            </button>
            <label htmlFor="cantidad" className="sr-only">Cantidad</label>
            <input
              id="cantidad"
              type="number"
              min="1"
              max={variante.stock}
              value={cantidad}
              disabled={!hayStock}
              onChange={(evento) => cambiarCantidad(Number(evento.target.value) || 1)}
              className="w-10 bg-transparent text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => cambiarCantidad(cantidad + 1)}
              disabled={!hayStock || cantidad >= variante.stock}
              aria-label="Sumar una unidad"
              className="grid h-12 w-11 place-items-center text-xl disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button type="submit" disabled={!hayStock} className="boton flex-1 bg-crema text-tostado hover:bg-kraft">
            Agregar al carrito
          </button>
        </div>
      </div>

      <BarraEnvioGratis monto={total} />
    </form>
  );
}
