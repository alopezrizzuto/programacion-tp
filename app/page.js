import Link from "next/link";
import HeroPortada from "./components/HeroPortada";
import ProcesoScroll from "./components/ProcesoScroll";
import TarjetaCafe from "./components/TarjetaCafe";
import TarjetaAccesorio from "./components/TarjetaAccesorio";
import BeneficiosCompra from "./components/BeneficiosCompra";
import TestCafe from "./components/TestCafe";
import Estrellas from "./components/Estrellas";
import { obtenerAccesorios, obtenerCafes } from "@/lib/datos";
import { PRUEBA_SOCIAL } from "@/lib/tienda";

const COMPARACION = [
  ["Fecha de tostado", "No figura, puede tener meses", "Menos de 7 días, impresa en la bolsa"],
  ["Origen", "Mezcla de orígenes sin identificar", "Un país, una región y un lote"],
  ["Molienda", "Una sola para todos los métodos", "La justa para tu método, o en grano"],
  ["Calidad", "Café comercial", "Café de especialidad, más de 84 puntos"],
];

export default async function Home() {
  const cafes = await obtenerCafes();
  const accesorios = await obtenerAccesorios();
  const resenas = cafes.flatMap((cafe) => cafe.resenas.map((resena) => ({ ...resena, cafe })));
  const promedio = resenas.reduce((suma, r) => suma + r.puntaje, 0) / resenas.length;
  const destacadas = resenas.filter((r) => r.puntaje === 5).slice(0, 6);

  return (
    <>
      {/* 1. Qué es Origen y cómo comprar, en la primera pantalla */}
      <HeroPortada cafes={cafes} />
      {/* 2. Recorrido animado del grano a la taza (único momento con scroll narrativo) */}
      <ProcesoScroll />

      {/* 3. Los productos, a la vista */}
      <section id="cafes" aria-labelledby="titulo-cafes" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="titulo-cafes" className="font-display text-5xl leading-[0.95] sm:text-6xl">
              Nuestros cafés
            </h2>
            <p className="mt-5 max-w-lg text-lg text-marron">
              Tres perfiles, dos orígenes cada uno. Elegí el peso y la molienda para tu cafetera.
            </p>
          </div>
          <Link href="/productos" className="boton">
            Ver todos los productos
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-3">
          {cafes.map((cafe) => (
            <TarjetaCafe key={cafe.id} cafe={cafe} />
          ))}
        </div>

        <div className="mt-24 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl leading-none sm:text-5xl">Para prepararlo mejor</h2>
            <p className="mt-4 max-w-lg text-lg text-marron">Guardarlo, medirlo y servirlo como en una cafetería.</p>
          </div>
          <Link href="/productos#accesorios" className="font-semibold underline underline-offset-4">
            Ver los accesorios
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {accesorios.map((accesorio) => (
            <TarjetaAccesorio key={accesorio.id} accesorio={accesorio} />
          ))}
        </div>
      </section>

      {/* 4. Condiciones de compra */}
      <BeneficiosCompra />

      {/* 5. Ayuda para elegir */}
      <TestCafe cafes={cafes} />

      {/* 6. Por qué Origen: comparación con el café de góndola */}
      <section aria-labelledby="titulo-diferencia" className="bg-tostado text-crema">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-28">
          <div>
            <h2 id="titulo-diferencia" className="font-display text-5xl leading-[0.95] sm:text-6xl">
              No es el café del súper
            </h2>
            <p className="mt-6 max-w-md text-lg text-kraft">
              El café pierde aroma semanas después de tostado. Por eso tostamos poco y seguido, y te contamos de dónde
              viene cada bolsa.
            </p>
          </div>
          <table className="w-full text-left">
            <caption className="sr-only">Comparación entre café de góndola y Origen Café</caption>
            <thead>
              <tr className="border-b border-white/20 text-kraft">
                <th scope="col" className="py-3 pr-4 font-normal"><span className="sr-only">Aspecto</span></th>
                <th scope="col" className="py-3 pr-4 font-normal">Café de góndola</th>
                <th scope="col" className="py-3 font-semibold text-crema">Origen Café</th>
              </tr>
            </thead>
            <tbody>
              {COMPARACION.map(([aspecto, gondola, origen]) => (
                <tr key={aspecto} className="border-b border-white/10 align-top">
                  <th scope="row" className="py-5 pr-4 font-semibold">{aspecto}</th>
                  <td className="py-5 pr-4 text-kraft">{gondola}</td>
                  <td className="py-5">{origen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Prueba social */}
      <section aria-labelledby="titulo-resenas" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="titulo-resenas" className="font-display text-5xl leading-[0.95] sm:text-6xl">
            {PRUEBA_SOCIAL.clientes} personas ya lo eligieron
          </h2>
          <p className="flex items-center gap-3 text-lg">
            <Estrellas puntaje={promedio} className="h-5 w-5" />
            <span>
              <strong className="font-semibold">{promedio.toLocaleString("es-AR", { maximumFractionDigits: 1 })}</strong> de 5
              en {resenas.length} reseñas
            </span>
          </p>
        </div>
        <ul className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
          {destacadas.map((resena) => (
            <li key={resena.autor} className="mb-5 break-inside-avoid">
              <figure className="rounded-3xl bg-kraft/45 p-7">
                <Estrellas puntaje={resena.puntaje} />
                <blockquote className="mt-4 text-xl leading-snug">{resena.texto}</blockquote>
                <figcaption className="mt-5 text-marron">
                  {resena.autor}, compró{" "}
                  <Link href={`/cafes/${resena.cafe.slug}`} className="text-tostado underline underline-offset-2">
                    {resena.cafe.nombre}
                  </Link>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

    </>
  );
}
