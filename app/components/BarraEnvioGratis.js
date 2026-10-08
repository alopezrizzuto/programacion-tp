import { PROMOS, formatearPrecio } from "@/lib/tienda";

// Muestra cuánto falta para el envío gratis, con una barra de avance.
// Se usa en la página de producto y en el carrito.
export default function BarraEnvioGratis({ monto }) {
  const falta = PROMOS.envioGratisDesde - monto;
  const avance = Math.min(1, monto / PROMOS.envioGratisDesde);

  return (
    <div>
      <p className="text-[15px]" aria-live="polite">
        {falta > 0 ? (
          <>
            Te faltan <strong className="font-semibold">{formatearPrecio(falta)}</strong> para el envío gratis
          </>
        ) : (
          <strong className="font-semibold">Tenés envío gratis</strong>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Avance hacia el envío gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(avance * 100)}
        className="mt-2 h-2 overflow-hidden rounded-full bg-kraft/70"
      >
        <div
          className="h-full rounded-full bg-tostado transition-[width] duration-500"
          style={{ width: `${avance * 100}%` }}
        />
      </div>
    </div>
  );
}
