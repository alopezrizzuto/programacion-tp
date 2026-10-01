"use client";

import { useState } from "react";
import { MOLIENDAS, nombrePeso } from "@/lib/cafes";
import { PROMOS, STOCK_BAJO, formatearPrecio, precioTransferencia, valorCuota } from "@/lib/tienda";

// Client Component: corre en el navegador porque reacciona a lo que elige el usuario.
// Cada useState guarda un dato que, al cambiar, vuelve a dibujar el componente.
export default function SelectorCompra({ cafe }) {
  const primeraConStock = cafe.variantes.find((variante) => variante.stock > 0) ?? cafe.variantes[0];
  const [varianteId, setVarianteId] = useState(primeraConStock.id);
  const [molienda, setMolienda] = useState(MOLIENDAS[0].id);
  const [cantidad, setCantidad] = useState(1);

  const variante = cafe.variantes.find((v) => v.id === varianteId);
  const hayStock = variante.stock > 0;
  const { desdeUnidades, porcentaje } = PROMOS.descuentoCantidad;
  const subtotal = variante.precio * cantidad;
  const total = cantidad >= desdeUnidades ? Math.round(subtotal * (1 - porcentaje / 100)) : subtotal;
  const faltaParaEnvioGratis = PROMOS.envioGratisDesde - total;

  function cambiarVariante(id) {
    const nueva = cafe.variantes.find((v) => v.id === id);
    setVarianteId(id);
    setCantidad((actual) => Math.max(1, Math.min(actual, nueva.stock)));
  }

  return (
    <form className="mt-8 space-y-8" onSubmit={(evento) => evento.preventDefault()}>
      <fieldset>
        <legend className="text-sm font-medium">Peso de la bolsa</legend>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {cafe.variantes.map((v) => (
            <label
              key={v.id}
              className={`flex cursor-pointer flex-col items-center border px-2 py-3 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-marron ${
                v.id === varianteId ? "border-tostado bg-tostado text-crema" : "border-marron hover:bg-kraft"
              } ${v.stock === 0 ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="peso"
                value={v.id}
                checked={v.id === varianteId}
                disabled={v.stock === 0}
                onChange={() => cambiarVariante(v.id)}
                className="sr-only"
              />
              <span className="font-medium">{nombrePeso(v.peso_gramos)}</span>
              <span className="text-xs">{v.stock === 0 ? "Sin stock" : formatearPrecio(v.precio)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="text-3xl font-medium">{formatearPrecio(variante.precio)}</p>
        <p className="mt-1 text-sm text-marron">
          {PROMOS.cuotasSinInteres} cuotas sin interés de {formatearPrecio(valorCuota(variante.precio))}
        </p>
        <p className="text-sm text-marron">
          <strong className="font-medium text-tostado">{formatearPrecio(precioTransferencia(variante.precio))}</strong>{" "}
          con transferencia ({PROMOS.descuentoTransferencia}% OFF)
        </p>
        {hayStock && variante.stock <= STOCK_BAJO && (
          <p className="mt-3 text-sm font-medium">¡Quedan solo {variante.stock} bolsas de {nombrePeso(variante.peso_gramos)}!</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div>
          <label htmlFor="molienda" className="text-sm font-medium">Molienda</label>
          <select
            id="molienda"
            value={molienda}
            onChange={(evento) => setMolienda(evento.target.value)}
            className="mt-2 w-full border border-marron bg-crema px-3 py-3"
          >
            {MOLIENDAS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} ({m.uso})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cantidad" className="text-sm font-medium">Cantidad</label>
          <input
            id="cantidad"
            type="number"
            min="1"
            max={variante.stock}
            value={cantidad}
            disabled={!hayStock}
            onChange={(evento) => setCantidad(Math.max(1, Math.min(Number(evento.target.value), variante.stock)))}
            className="mt-2 w-full border border-marron bg-crema px-3 py-3"
          />
        </div>
      </div>

      {/* aria-live: los lectores de pantalla anuncian los cambios de este bloque */}
      <div aria-live="polite" className="space-y-1 border-t border-kraft pt-6 text-sm">
        {cantidad >= desdeUnidades ? (
          <p>
            Llevando {cantidad} bolsas: <strong className="font-medium">{porcentaje}% OFF</strong>. Total{" "}
            <s className="text-marron">{formatearPrecio(subtotal)}</s>{" "}
            <strong className="font-medium">{formatearPrecio(total)}</strong>
          </p>
        ) : (
          <p className="text-marron">Sumá otra bolsa y ahorrá {porcentaje}% sobre el total.</p>
        )}
        <p className="text-marron">
          {faltaParaEnvioGratis > 0
            ? `Te faltan ${formatearPrecio(faltaParaEnvioGratis)} para el envío gratis.`
            : "¡Tenés envío gratis!"}
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled
          className="boton w-full"
        >
          Agregar al carrito
        </button>
        <p className="mt-2 text-center text-xs text-marron">El carrito se habilita en la próxima etapa del proyecto.</p>
      </div>
    </form>
  );
}
