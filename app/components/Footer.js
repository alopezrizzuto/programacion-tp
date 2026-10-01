import Link from "next/link";
import { ENVIOS, PROMOS } from "@/lib/tienda";

export default function Footer() {
  return (
    <footer className="mt-24 bg-beige text-sm">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-semibold">Origen Café</p>
          <p className="mt-2 text-cafe">Café de especialidad, tostado cada semana en Buenos Aires.</p>
        </div>

        <nav aria-label="Tienda">
          <h2 className="font-medium">Tienda</h2>
          <ul className="mt-3 space-y-2 text-cafe">
            <li><Link href="/catalogo" className="hover:underline">Catálogo</Link></li>
            <li><Link href="/carrito" className="hover:underline">Carrito</Link></li>
          </ul>
        </nav>

        <nav aria-label="Tu cuenta">
          <h2 className="font-medium">Tu cuenta</h2>
          <ul className="mt-3 space-y-2 text-cafe">
            <li><Link href="/login" className="hover:underline">Ingresar</Link></li>
            <li><Link href="/registro" className="hover:underline">Crear cuenta</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="font-medium">Envíos y pagos</h2>
          <ul className="mt-3 space-y-2 text-cafe">
            {ENVIOS.map((envio) => (
              <li key={envio.zona}>{envio.zona}: {envio.plazo}</li>
            ))}
            <li>{PROMOS.cuotasSinInteres} cuotas sin interés con Mercado Pago</li>
          </ul>
        </div>
      </div>

      <p className="border-t border-crema px-4 py-4 text-center text-xs text-cafe">
        Tienda de demostración · Proyecto académico de Programación Web (ITBA). No se realizan ventas reales.
      </p>
    </footer>
  );
}
