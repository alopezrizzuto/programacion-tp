import Link from "next/link";
import Image from "next/image";
import fotoPortada from "../../public/portada.webp";
import { PROMOS, formatearPrecio } from "@/lib/tienda";

const BENEFICIOS = [
  `Envío gratis desde ${formatearPrecio(PROMOS.envioGratisDesde)}`,
  `${PROMOS.cuotasSinInteres} cuotas sin interés`,
  `${PROMOS.descuentoTransferencia}% OFF por transferencia`,
];

// Primera pantalla de la portada: qué vende Origen y cómo comprar, sin esperar ninguna animación.
// Solo la foto tiene movimiento: entra una vez al cargar (entrar-bolsa) y se aleja apenas al bajar (hero-bolsas, en globals.css).
export default function HeroPortada({ cafes }) {
  return (
    <section aria-labelledby="titulo-portada" className="relative overflow-hidden bg-tostado text-crema">
      {/* Luz cálida detrás de las bolsas */}
      <div
        aria-hidden="true"
        className="absolute -right-40 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#6b4630_0%,transparent_68%)] opacity-70"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pb-12 pt-10 sm:px-6 lg:min-h-[min(46rem,calc(100svh-6.25rem))] lg:grid-cols-2 lg:gap-12 lg:py-12">
        {/* El texto aparece de inmediato (sin animación): es lo primero que hay que poder leer */}
        <div>
          <p className="text-kraft">Tostado cada semana en Buenos Aires</p>
          <h1 id="titulo-portada" className="mt-3 font-display text-5xl leading-[0.92] sm:text-7xl">
            Café de especialidad, recién tostado
          </h1>
          <p className="mt-6 max-w-lg text-lg text-kraft">
            {cafes.length} cafés de altura en bolsas de 250 g a 1 kg, en grano o molidos para tu cafetera. Te llegan con
            menos de 7 días de tostado.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/productos" className="boton bg-crema text-tostado hover:bg-kraft">
              Comprar café
            </Link>
            <a href="#elegi" className="boton-secundario text-crema">
              Elegí tu café ideal
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-kraft">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {beneficio}
              </li>
            ))}
          </ul>
        </div>

        {/* Foto de las tres bolsas (una por perfil). Decorativa: los cafés se nombran en la grilla de abajo.
            La máscara funde los bordes de la foto con el fondo oscuro, para que no se vea el recuadro. */}
        <div className="hero-bolsas relative mx-auto w-full max-w-xl lg:max-w-none">
          <Image
            src={fotoPortada}
            alt=""
            priority
            sizes="(min-width: 1024px) 50vw, (min-width: 640px) 36rem, 100vw"
            placeholder="blur"
            className="h-auto w-full animate-[entrar-bolsa_0.9s_cubic-bezier(0.2,0.8,0.2,1)_both] [mask-image:radial-gradient(ellipse_closest-side,black_62%,transparent_100%)]"
          />
        </div>
      </div>
    </section>
  );
}
