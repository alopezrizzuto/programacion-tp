import Link from "next/link";
import { PERFILES } from "@/lib/productos";
import { ENVIOS, PROMOS, formatearPrecio } from "@/lib/tienda";

export default function Footer() {
  return (
    <footer className="mt-24 bg-tostado text-kraft">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl text-crema">Origen Café</p>
            <p className="mt-3 max-w-xs">
              Café de especialidad tostado cada semana en Buenos Aires y molido para tu método.
            </p>
          </div>

          <nav aria-label="Productos">
            <h2 className="font-semibold text-crema">Productos</h2>
            <ul className="mt-4 space-y-2">
              {PERFILES.map((perfil) => (
                <li key={perfil.id}>
                  <Link href={`/productos#${perfil.id}`} className="hover:text-crema">Cafés {perfil.plural.toLowerCase()}</Link>
                </li>
              ))}
              <li><Link href="/productos#accesorios" className="hover:text-crema">Accesorios</Link></li>
            </ul>
          </nav>

          <nav aria-label="Ayuda">
            <h2 className="font-semibold text-crema">Ayuda</h2>
            <ul className="mt-4 space-y-2">
              <li><Link href="/#elegi" className="hover:text-crema">Elegí tu café ideal</Link></li>
              <li><Link href="/contacto" className="hover:text-crema">Contacto</Link></li>
              <li><Link href="/ingresar" className="hover:text-crema">Ingresar</Link></li>
              <li><Link href="/registro" className="hover:text-crema">Crear cuenta</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="font-semibold text-crema">Envíos y pagos</h2>
            <ul className="mt-4 space-y-2">
              {ENVIOS.map((envio) => (
                <li key={envio.zona}>{envio.zona}: {envio.plazo}</li>
              ))}
              <li>Envío gratis desde {formatearPrecio(PROMOS.envioGratisDesde)}</li>
              <li>{PROMOS.cuotasSinInteres} cuotas sin interés con Mercado Pago</li>
            </ul>
          </div>
        </div>

        <p className="mt-16 border-t border-white/10 pt-6 text-sm">
          Tienda de demostración: proyecto académico de Programación Web (ITBA). No se realizan ventas reales y las
          reseñas y estadísticas son de ejemplo.
        </p>
      </div>
    </footer>
  );
}
