"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import BarraEnvioGratis from "../BarraEnvioGratis";
import FechaEntrega from "../FechaEntrega";
import LineaCarrito from "./LineaCarrito";
import UpsellAccesorios from "./UpsellAccesorios";
import ResumenCarrito from "./ResumenCarrito";
import { useCarrito } from "./ProveedorCarrito";

// Panel lateral del carrito. Usa <dialog>: con showModal() el navegador ya se encarga
// de atrapar el foco adentro, cerrar con Escape y oscurecer el fondo.
export default function PanelCarrito() {
  const { abierto, cerrar, lineas, unidades, total } = useCarrito();
  const dialogo = useRef(null);

  // Sincroniza el estado de React con el <dialog> real del navegador
  useEffect(() => {
    const elemento = dialogo.current;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-panel-carrito"
      onClose={cerrar}
      // Un clic en el fondo oscuro (fuera del panel) lo cierra
      onClick={(evento) => evento.target === evento.currentTarget && cerrar()}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-md bg-crema p-0 text-tostado backdrop:bg-tostado/60 open:animate-[entrar-panel_250ms_ease-out]"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-marron/20 px-5 py-4">
          <h2 id="titulo-panel-carrito" className="font-display text-2xl">
            Tu carrito {unidades > 0 && <span className="text-marron">({unidades})</span>}
          </h2>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar carrito"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-kraft/60"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        {lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-2xl">Tu carrito está vacío</p>
            <p className="text-marron">Elegí un café y la molienda para tu cafetera. Te lo tostamos esta semana.</p>
            <Link href="/productos" onClick={cerrar} className="boton mt-2">
              Ver los productos
            </Link>
            <Link href="/#elegi" onClick={cerrar} className="underline underline-offset-4">
              No sé cuál elegir
            </Link>
          </div>
        ) : (
          <>
            {/* Zona con scroll: barra de envío, productos, entrega y sugerencias */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <BarraEnvioGratis monto={total} />
              <ul className="divide-y divide-marron/15 border-y border-marron/15">
                {lineas.map((linea) => (
                  <LineaCarrito key={linea.clave} linea={linea} />
                ))}
              </ul>
              <FechaEntrega />
              <UpsellAccesorios />
            </div>

            {/* Pie fijo: totales y botón, siempre visibles */}
            <div className="border-t border-marron/20 px-5 py-4">
              <ResumenCarrito compacto />
              <Link
                href="/carrito"
                onClick={cerrar}
                className="mt-3 block text-center font-semibold underline underline-offset-4"
              >
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
