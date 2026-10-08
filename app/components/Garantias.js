import { PROMOS, formatearPrecio } from "@/lib/tienda";

// Garantías de compra y envío. Se usa en la portada y en la página de producto.
const GARANTIAS = [
  {
    titulo: "Pago seguro",
    texto: `Con Mercado Pago, en ${PROMOS.cuotasSinInteres} cuotas sin interés, o ${PROMOS.descuentoTransferencia}% menos por transferencia.`,
    icono: <path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z M12 14v2" />,
  },
  {
    titulo: "Envío asegurado",
    texto: `Si tu pedido llega dañado, te lo reponemos sin cargo. Gratis desde ${formatearPrecio(PROMOS.envioGratisDesde)}.`,
    icono: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  },
  {
    titulo: "Garantía de sabor",
    texto: "Si el café no te gusta, te lo cambiamos por otro origen dentro de los 30 días.",
    icono: <path d="M5 9h12v4a6 6 0 0 1-12 0zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3" />,
  },
];

export default function Garantias({ compacta = false }) {
  return (
    <section aria-label="Garantías" className={compacta ? "" : "border-t border-marron/15"}>
      <ul className={`mx-auto grid max-w-7xl ${compacta ? "gap-5" : "gap-8 px-4 py-14 sm:px-6 md:grid-cols-3"}`}>
        {GARANTIAS.map((garantia) => (
          <li key={garantia.titulo} className="flex gap-4">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-7 w-7 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {garantia.icono}
            </svg>
            <div>
              <p className="font-semibold">{garantia.titulo}</p>
              <p className="mt-1 text-marron">{garantia.texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
