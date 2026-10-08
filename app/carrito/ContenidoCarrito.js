"use client";

import Link from "next/link";
import BarraEnvioGratis from "../components/BarraEnvioGratis";
import Garantias from "../components/Garantias";
import LineaCarrito from "../components/carrito/LineaCarrito";
import UpsellAccesorios from "../components/carrito/UpsellAccesorios";
import ResumenCarrito from "../components/carrito/ResumenCarrito";
import { useCarrito } from "../components/carrito/ProveedorCarrito";

// Versión de página completa del carrito: misma lógica que el panel, con más espacio.
export default function ContenidoCarrito() {
  const { lineas, unidades, total } = useCarrito();

  if (lineas.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-3xl bg-kraft/45 px-6 py-20 text-center">
        <p className="font-display text-3xl">Tu carrito está vacío</p>
        <p className="mt-3 max-w-sm text-marron">Elegí un café y la molienda para tu cafetera. Te lo tostamos esta semana.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/productos" className="boton">
            Ver los productos
          </Link>
          <Link href="/#elegi" className="boton-secundario">
            Hacer el test de café
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      {/* min-w-0: deja que la columna se achique; sin esto, un texto que no se corta la ensancha */}
      <div className="min-w-0 space-y-8">
        <p className="text-marron">
          {unidades} {unidades === 1 ? "producto" : "productos"}
        </p>
        <BarraEnvioGratis monto={total} />
        <ul className="divide-y divide-marron/15 border-y border-marron/15">
          {lineas.map((linea) => (
            <LineaCarrito key={linea.clave} linea={linea} grande />
          ))}
        </ul>
        <UpsellAccesorios />
      </div>

      <aside aria-label="Resumen del pedido" className="min-w-0 space-y-8 rounded-3xl bg-kraft/30 p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-3xl">Resumen</h2>
        <ResumenCarrito />
        <div className="border-t border-marron/20 pt-6">
          <Garantias compacta />
        </div>
      </aside>
    </div>
  );
}
