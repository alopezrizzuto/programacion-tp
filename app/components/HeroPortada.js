import Link from "next/link";
import BolsaCafe from "./BolsaCafe";
import { PERFILES } from "@/lib/productos";
import { PROMOS, formatearPrecio } from "@/lib/tienda";

// Las tres bolsas del hero (una por perfil): posición, tamaño, giro y cuándo entra cada una
const POSICIONES = [
  "-left-[2%] bottom-[8%] w-[41%] -rotate-[9deg] lg:w-[44%]",
  "left-1/2 bottom-0 z-10 w-[50%] -translate-x-1/2 lg:w-[55%]",
  "-right-[2%] bottom-[8%] w-[41%] rotate-[8deg] lg:w-[44%]",
];
const DEMORAS = ["0.25s", "0.1s", "0.4s"];

const BENEFICIOS = [
  `Envío gratis desde ${formatearPrecio(PROMOS.envioGratisDesde)}`,
  `${PROMOS.cuotasSinInteres} cuotas sin interés`,
  `${PROMOS.descuentoTransferencia}% OFF por transferencia`,
];

// Primera pantalla de la portada: qué vende Origen y cómo comprar, sin esperar ninguna animación.
// Solo las bolsas tienen movimiento: entran una vez al cargar (entrar-bolsa) y se alejan apenas al bajar (hero-bolsas, en globals.css).
export default function HeroPortada({ cafes }) {
  const bolsas = PERFILES.map((perfil) => cafes.find((cafe) => cafe.perfil === perfil.id)).filter(Boolean);

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

        {/* Decorativo: las bolsas ya se nombran en la grilla de cafés */}
        <div aria-hidden="true" className="hero-bolsas relative mx-auto h-[18rem] w-full max-w-xl sm:h-[28rem] lg:h-[37rem] lg:max-w-none">
          {bolsas.map((cafe, i) => (
            <div
              key={cafe.id}
              className={`absolute animate-[entrar-bolsa_0.9s_cubic-bezier(0.2,0.8,0.2,1)_both] ${POSICIONES[i]}`}
              style={{ animationDelay: DEMORAS[i] }}
            >
              <BolsaCafe cafe={cafe} className="h-auto w-full drop-shadow-[0_24px_30px_rgba(0,0,0,0.35)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
