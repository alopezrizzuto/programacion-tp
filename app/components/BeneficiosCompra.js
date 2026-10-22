import { BUNDLES, PROMOS, formatearPrecio } from "@/lib/tienda";
import { HORA_CORTE } from "@/lib/entrega";

const [, dos, tres] = BUNDLES;

// Condiciones de compra en un solo lugar y a la vista: todo sale de lib/tienda.js y lib/entrega.js
const BENEFICIOS = [
  {
    titulo: "Envíos a todo el país",
    texto: `Gratis desde ${formatearPrecio(PROMOS.envioGratisDesde)}; si no, ${formatearPrecio(PROMOS.costoEnvio)}. Comprando antes de las ${HORA_CORTE} h de un día hábil, sale ese mismo día.`,
    icono: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  },
  {
    titulo: "Pagá como quieras",
    texto: `Con Mercado Pago, hasta ${PROMOS.cuotasSinInteres} cuotas sin interés, o ${PROMOS.descuentoTransferencia}% OFF en los productos pagando por transferencia.`,
    icono: <path d="M3 6h18v12H3zM3 10h18M7 15h3" />,
  },
  {
    titulo: "Llevá más, pagá menos",
    texto: `${dos.unidades} bolsas iguales: ${dos.descuento}% OFF. ${tres.unidades} o más: ${tres.descuento}% OFF. Podés elegir una molienda distinta para cada una.`,
    icono: <path d="M4 8h10v12H4zM8 8V5h10v12h-4M11 5V3" />,
  },
  {
    titulo: "Sin crear una cuenta",
    texto: "Comprás solo con tu email y seguís el pedido con su código, en Seguí tu pedido.",
    icono: <path d="M5 4h14v16H5zM9 9h6M9 13h6M9 17h3" />,
  },
];

export default function BeneficiosCompra() {
  return (
    <section aria-labelledby="titulo-compra" className="bg-kraft/45">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 id="titulo-compra" className="font-display text-3xl leading-none sm:text-4xl">
          Comprar es simple
        </h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio.titulo}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {beneficio.icono}
              </svg>
              <h3 className="mt-4 text-lg font-semibold">{beneficio.titulo}</h3>
              <p className="mt-1 text-marron">{beneficio.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
