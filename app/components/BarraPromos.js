import { PROMOS, formatearPrecio } from "@/lib/tienda";

export default function BarraPromos() {
  return (
    <aside aria-label="Promociones" className="bg-kraft text-tostado text-sm">
      <ul className="mx-auto flex max-w-7xl items-center justify-center gap-x-8 px-4 py-2">
        <li>
          <strong className="font-semibold">{PROMOS.descuentoTransferencia}% OFF</strong> pagando por transferencia
        </li>
        <li className="hidden md:block">
          <strong className="font-semibold">{PROMOS.cuotasSinInteres} cuotas</strong> sin interés
        </li>
        <li className="hidden sm:block">
          Envío gratis desde <strong className="font-semibold">{formatearPrecio(PROMOS.envioGratisDesde)}</strong>
        </li>
      </ul>
    </aside>
  );
}
