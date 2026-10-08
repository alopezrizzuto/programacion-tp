import { PRUEBA_SOCIAL } from "@/lib/tienda";
import { promedioResenas } from "@/lib/productos";

// Números de confianza (de ejemplo: el footer aclara que es una tienda de demostración)
export default function BarraEstadisticas({ producto }) {
  const promedio = promedioResenas(producto);
  const datos = [
    // Sin reseñas todavía, se muestra el despacho en lugar del promedio
    promedio > 0
      ? [promedio.toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " de 5", "en reseñas de clientes"]
      : ["Hoy", "despachamos si comprás antes de las 14"],
    [PRUEBA_SOCIAL.clientes, "personas ya compraron en Origen"],
    [PRUEBA_SOCIAL.recompra, "vuelve a comprar el mismo café"],
    [PRUEBA_SOCIAL.despacho, "para despachar tu pedido"],
  ];

  return (
    <section aria-label="Origen Café en números" className="rounded-3xl bg-tostado text-crema">
      <dl className="grid grid-cols-2 gap-y-8 px-6 py-10 sm:px-10 lg:grid-cols-4">
        {datos.map(([valor, texto]) => (
          <div key={texto} className="flex flex-col-reverse px-2">
            <dt className="mt-1 text-kraft">{texto}</dt>
            <dd className="font-display text-3xl sm:text-4xl">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
