import Link from "next/link";
import Image from "next/image";
import fotoPortada from "../../public/portada.webp";
import { PROMOS, formatearPrecio } from "@/lib/tienda";

const BENEFICIOS = [
  `Envío gratis desde ${formatearPrecio(PROMOS.envioGratisDesde)}`,
  `${PROMOS.cuotasSinInteres} cuotas sin interés`,
  `${PROMOS.descuentoTransferencia}% OFF por transferencia`,
];

// Segundo bloque de la portada, después del hero: las tres bolsas (una por perfil) y cómo comprar.
// Sigue el fondo oscuro del hero, así el paso de uno a otro se siente continuo.
// La foto aparece a medida que entra en pantalla (revelar-bolsas, en globals.css).
export default function PresentacionCafes({ cafes }) {
  return (
    <section aria-labelledby="titulo-presentacion" className="relative overflow-hidden bg-tostado text-crema">
      {/* Luz cálida detrás de las bolsas */}
      <div
        aria-hidden="true"
        className="absolute -right-40 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#6b4630_0%,transparent_68%)] opacity-70"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div>
          <h2 id="titulo-presentacion" className="font-display text-5xl leading-[0.92] sm:text-6xl">
            Recién tostado, en tu puerta
          </h2>
          <p className="mt-6 max-w-lg text-lg text-kraft">
            {cafes.length} cafés de altura en bolsas de 250 g a 1 kg, en grano o molidos para tu cafetera. Te llegan con
            menos de 7 días de tostado.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/productos" className="boton bg-crema text-tostado hover:bg-kraft">
              Ver todos los cafés
            </Link>
            <a href="#elegi" className="boton-secundario text-crema">
              Hacer el test
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
        <div className="revelar-bolsas relative mx-auto w-full max-w-xl lg:max-w-none">
          <Image
            src={fotoPortada}
            alt=""
            sizes="(min-width: 1024px) 50vw, (min-width: 640px) 36rem, 100vw"
            placeholder="blur"
            className="h-auto w-full [mask-image:radial-gradient(ellipse_closest-side,black_62%,transparent_100%)]"
          />
        </div>
      </div>
    </section>
  );
}
