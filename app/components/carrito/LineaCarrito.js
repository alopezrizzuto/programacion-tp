"use client";

import Link from "next/link";
import ImagenProducto from "../ImagenProducto";
import { useCarrito } from "./ProveedorCarrito";
import { MOLIENDAS, nombrePeso } from "@/lib/productos";
import { BUNDLES, formatearPrecio } from "@/lib/tienda";

// Una línea del carrito: producto, detalle, cantidad, precio y la sugerencia de bundle.
export default function LineaCarrito({ linea, grande = false }) {
  const { cambiarCantidad, quitar, sumar, cerrar } = useCarrito();
  const { producto, variante, molienda, cantidad } = linea;
  const esCafe = producto.categoria === "cafe";
  const href = `/${esCafe ? "cafes" : "accesorios"}/${producto.slug}`;
  const detalle = esCafe
    ? `${nombrePeso(variante.peso_gramos)}, molienda ${MOLIENDAS.find((m) => m.id === molienda)?.nombre.toLowerCase()}`
    : variante.nombre;
  // Próximo bundle que podría alcanzar sumando bolsas (solo cafés)
  const siguiente = esCafe ? BUNDLES.find((bundle) => bundle.descuento > linea.descuento) : null;

  return (
    <li className="flex gap-4 py-5">
      <Link href={href} onClick={cerrar} className={`shrink-0 overflow-hidden rounded-xl ${grande ? "w-28" : "w-20"}`}>
        <ImagenProducto producto={producto} sizes="112px" miniatura />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} onClick={cerrar} className={`font-semibold hover:underline ${grande ? "text-lg" : ""}`}>
              {producto.nombre}
            </Link>
            <p className="text-sm text-marron">{detalle}</p>
          </div>
          <div className="text-right tabular-nums">
            {linea.descuento > 0 && <s className="block text-sm text-marron">{formatearPrecio(linea.subtotal)}</s>}
            <p className="font-semibold">{formatearPrecio(linea.total)}</p>
          </div>
        </div>

        {linea.descuento > 0 && (
          <p className="mt-1 text-sm font-semibold text-cereza">−{linea.descuento}% por llevar varias bolsas</p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-marron/40">
            <button
              type="button"
              onClick={() => cambiarCantidad(linea.clave, cantidad - 1)}
              aria-label={`Restar una unidad de ${producto.nombre}`}
              className="grid h-9 w-9 place-items-center text-lg"
            >
              −
            </button>
            <span className="w-6 text-center tabular-nums" aria-label={`Cantidad: ${cantidad}`}>
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => cambiarCantidad(linea.clave, cantidad + 1)}
              disabled={cantidad >= variante.stock}
              aria-label={`Sumar una unidad de ${producto.nombre}`}
              className="grid h-9 w-9 place-items-center text-lg disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button type="button" onClick={() => quitar(linea.clave)} className="text-sm underline underline-offset-2">
            Quitar
          </button>
        </div>

        {siguiente && variante.stock > cantidad && (
          <button
            type="button"
            onClick={() => sumar({ varianteId: variante.id, molienda, cantidad: siguiente.unidades - cantidad })}
            className="mt-3 self-start rounded-full bg-kraft/60 px-3 py-1.5 text-left text-sm hover:bg-kraft"
          >
            Sumá {siguiente.unidades - cantidad} y ahorrá {siguiente.descuento}%
          </button>
        )}
      </div>
    </li>
  );
}
