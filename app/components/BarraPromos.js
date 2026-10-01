import { PROMOS, formatearPrecio } from "@/lib/tienda";

export default function BarraPromos() {
  return (
    <aside aria-label="Promociones" className="bg-espresso text-crema text-xs tracking-wide">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2">
        <li>{PROMOS.descuentoTransferencia}% OFF por transferencia</li>
        <li className="hidden sm:block">{PROMOS.cuotasSinInteres} cuotas sin interés</li>
        <li>Envío gratis desde {formatearPrecio(PROMOS.envioGratisDesde)}</li>
      </ul>
    </aside>
  );
}
