"use client";

import Link from "next/link";
import FechaEntrega from "../FechaEntrega";
import { useCarrito } from "./ProveedorCarrito";
import { PROMOS, formatearPrecio } from "@/lib/tienda";

// Totales, ahorro por transferencia, entrega estimada y mensajes de pago seguro.
// "compacto": versión más baja para el pie del panel lateral (ahí la entrega va arriba, en la lista).
export default function ResumenCarrito({ compacto = false }) {
  const { subtotal, ahorroBundles, costoEnvio, totalAPagar, totalTransferencia, ahorroTransferencia, unidades, cerrar } =
    useCarrito();

  return (
    <div className={compacto ? "space-y-3" : "space-y-5"}>
      <dl className={`tabular-nums ${compacto ? "space-y-0.5 text-[15px]" : "space-y-1.5"}`}>
        {ahorroBundles > 0 && (
          <>
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatearPrecio(subtotal)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-cereza">
              <dt>Descuento por bolsas</dt>
              <dd>−{formatearPrecio(ahorroBundles)}</dd>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <dt>Envío</dt>
          <dd>{costoEnvio === 0 ? "Gratis" : formatearPrecio(costoEnvio)}</dd>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <dt>Total</dt>
          <dd>{formatearPrecio(totalAPagar)}</dd>
        </div>
        <div className="flex justify-between gap-4 rounded-xl bg-tostado px-3 py-2 text-crema">
          <dt>Pagando por transferencia</dt>
          <dd className="text-right">
            <strong className="font-semibold">{formatearPrecio(totalTransferencia)}</strong>
            {!compacto && (
              <span className="block text-sm text-kraft">
                Ahorrás {formatearPrecio(ahorroTransferencia)} ({PROMOS.descuentoTransferencia}% OFF)
              </span>
            )}
          </dd>
        </div>
      </dl>

      {!compacto && <FechaEntrega />}

      {unidades > 0 && (
        <Link href="/checkout" onClick={cerrar} className="boton w-full">
          Finalizar compra
        </Link>
      )}

      <p className="flex items-center gap-2 text-sm text-marron">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z M12 14v2" />
        </svg>
        {compacto
          ? `Pago seguro con Mercado Pago, hasta ${PROMOS.cuotasSinInteres} cuotas sin interés.`
          : `Pago seguro con Mercado Pago, en ${PROMOS.cuotasSinInteres} cuotas sin interés. No hace falta crear una cuenta para comprar.`}
      </p>
    </div>
  );
}
