"use client";

import { useState } from "react";
import Estrellas from "../../components/Estrellas";
import BarraEnvioGratis from "../../components/BarraEnvioGratis";
import { MOLIENDAS, nombrePeso } from "@/lib/cafes";
import {
  BUNDLES,
  PROMOS,
  PRUEBA_SOCIAL,
  STOCK_BAJO,
  descuentoPorCantidad,
  formatearPrecio,
  precioTransferencia,
  totalConBundle,
  valorCuota,
} from "@/lib/tienda";

// Client Component: corre en el navegador porque reacciona a lo que elige el usuario.
// Cada useState guarda un dato que, al cambiar, vuelve a dibujar el componente.
// La cantidad es el dato "verdadero": los bundles son atajos que la cambian.
export default function SelectorCompra({ cafe, beneficios, promedio }) {
  const primeraConStock = cafe.variantes.find((variante) => variante.stock > 0) ?? cafe.variantes[0];
  const [varianteId, setVarianteId] = useState(primeraConStock.id);
  const [molienda, setMolienda] = useState(MOLIENDAS[0].id);
  const [cantidad, setCantidad] = useState(1);

  const variante = cafe.variantes.find((v) => v.id === varianteId);
  const hayStock = variante.stock > 0;
  const descuento = descuentoPorCantidad(cantidad);
  const subtotal = variante.precio * cantidad;
  const total = totalConBundle(variante.precio, cantidad);

  function cambiarCantidad(nueva) {
    setCantidad(Math.max(1, Math.min(nueva, variante.stock)));
  }

  function cambiarVariante(id) {
    const nueva = cafe.variantes.find((v) => v.id === id);
    setVarianteId(id);
    setCantidad((actual) => Math.max(1, Math.min(actual, nueva.stock)));
  }

  return (
    <form className="mt-8 space-y-8" onSubmit={(evento) => evento.preventDefault()}>
      <fieldset>
        <legend className="font-semibold">Peso de la bolsa</legend>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {cafe.variantes.map((v) => (
            <label
              key={v.id}
              className={`flex cursor-pointer flex-col items-center rounded-2xl border-[1.5px] px-2 py-3 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tostado ${
                v.id === varianteId ? "border-tostado bg-tostado text-crema" : "border-marron/40 hover:border-tostado"
              } ${v.stock === 0 ? "cursor-not-allowed opacity-50" : ""}`}
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
              <span className="font-semibold">{nombrePeso(v.peso_gramos)}</span>
              <span className="text-sm">{v.stock === 0 ? "Sin stock" : formatearPrecio(v.precio)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="molienda" className="font-semibold">
          Molienda
        </label>
        <select
          id="molienda"
          value={molienda}
          onChange={(evento) => setMolienda(evento.target.value)}
          className="mt-3 w-full rounded-2xl border-[1.5px] border-marron/40 bg-crema px-4 py-3"
        >
          {MOLIENDAS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} ({m.uso})
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {beneficios.map((beneficio) => (
          <li key={beneficio} className="flex gap-3">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="first-letter:uppercase">{beneficio}</span>
          </li>
        ))}
      </ul>

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-kraft/45 px-4 py-3">
        <Estrellas puntaje={promedio} />
        <span>
          <strong className="font-semibold">{PRUEBA_SOCIAL.clientes} personas</strong> ya eligieron Origen Café
        </span>
      </p>

      <fieldset disabled={!hayStock}>
        <legend className="font-semibold">Llevá más y ahorrá</legend>
        <div className="mt-3 space-y-3">
          {BUNDLES.map((bundle) => {
            const elegido = bundle.unidades === 3 ? cantidad >= 3 : cantidad === bundle.unidades;
            const alcanza = variante.stock >= bundle.unidades;
            const totalBundle = totalConBundle(variante.precio, bundle.unidades);
            return (
              <label
                key={bundle.unidades}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border-[1.5px] px-4 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tostado ${
                  elegido ? "border-tostado bg-kraft/45" : "border-marron/30 hover:border-tostado"
                } ${alcanza ? "" : "cursor-not-allowed opacity-50"}`}
              >
                <input
                  type="radio"
                  name="bundle"
                  checked={elegido}
                  disabled={!alcanza}
                  onChange={() => cambiarCantidad(bundle.unidades)}
                  className="h-4 w-4 accent-tostado"
                />
                <span className="flex-1">
                  <span className="font-semibold">
                    {bundle.unidades} {bundle.unidades === 1 ? "bolsa" : "bolsas"}
                  </span>
                  {bundle.descuento > 0 && <span className="ml-2 font-semibold text-cereza">−{bundle.descuento}%</span>}
                  {bundle.etiqueta && (
                    <span className="ml-2 rounded-full bg-tostado px-2.5 py-0.5 text-sm text-crema">{bundle.etiqueta}</span>
                  )}
                  <span className="block text-sm text-marron">
                    {formatearPrecio(Math.round(totalBundle / bundle.unidades))} cada una
                  </span>
                </span>
                <span className="text-right tabular-nums">
                  {bundle.descuento > 0 && (
                    <s className="block text-sm text-marron">{formatearPrecio(variante.precio * bundle.unidades)}</s>
                  )}
                  <span className="font-semibold">{formatearPrecio(totalBundle)}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Urgencia honesta: muestra el stock real de la variante elegida */}
      <p className={`flex items-center gap-2 font-semibold ${hayStock && variante.stock <= STOCK_BAJO ? "text-cereza" : ""}`}>
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-current" />
        {!hayStock
          ? "Sin stock en este peso"
          : variante.stock <= STOCK_BAJO
            ? `Quedan solo ${variante.stock} ${variante.stock === 1 ? "bolsa" : "bolsas"} de ${nombrePeso(variante.peso_gramos)}`
            : "En stock, listo para despachar"}
      </p>

      {/* aria-live: los lectores de pantalla anuncian los cambios de precio */}
      <div aria-live="polite" className="rounded-3xl bg-tostado p-6 text-crema">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-display text-4xl tabular-nums">{formatearPrecio(total)}</span>
          {descuento > 0 && <s className="text-kraft tabular-nums">{formatearPrecio(subtotal)}</s>}
        </p>
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
              aria-label="Restar una bolsa"
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
              aria-label="Sumar una bolsa"
              className="grid h-12 w-11 place-items-center text-xl disabled:opacity-40"
            >
              +
            </button>
          </div>
          {/* El carrito se conecta en el próximo PR */}
          <button type="submit" disabled className="boton flex-1 bg-crema text-tostado hover:bg-kraft">
            Agregar al carrito
          </button>
        </div>
      </div>

      <BarraEnvioGratis monto={total} />
    </form>
  );
}
