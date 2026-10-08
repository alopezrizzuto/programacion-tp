import Link from "next/link";
import ProcesoScroll from "./components/ProcesoScroll";
import TestCafe from "./components/TestCafe";
import Estrellas from "./components/Estrellas";
import Garantias from "./components/Garantias";
import { ESTILO_PERFIL } from "./components/estilos";
import { PERFILES, obtenerCafes, precioDesde } from "@/lib/cafes";
import { PRUEBA_SOCIAL, formatearPrecio } from "@/lib/tienda";

const COMPARACION = [
  ["Fecha de tostado", "No figura, puede tener meses", "Menos de 7 días, impresa en la bolsa"],
  ["Origen", "Mezcla de orígenes sin identificar", "Un país, una región y un lote"],
  ["Molienda", "Una sola para todos los métodos", "La justa para tu método, o en grano"],
  ["Calidad", "Café comercial", "Café de especialidad, más de 84 puntos"],
];

export default function Home() {
  const cafes = obtenerCafes();
  const resenas = cafes.flatMap((cafe) => cafe.resenas.map((resena) => ({ ...resena, cafe })));
  const promedio = resenas.reduce((suma, r) => suma + r.puntaje, 0) / resenas.length;
  const destacadas = resenas.filter((r) => r.puntaje === 5).slice(0, 6);

  return (
    <>
      <ProcesoScroll />
      <TestCafe />

      {/* Perfiles con sus cafés */}
      <section aria-labelledby="titulo-perfiles" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="titulo-perfiles" className="font-display text-5xl leading-[0.95] sm:text-6xl">
              O elegí por perfil
            </h2>
            <p className="mt-5 max-w-lg text-lg text-marron">
              Agrupamos los cafés según cómo se sienten en la taza. Dos orígenes por perfil, en bolsas de 250 g a 1 kg.
            </p>
          </div>
          <Link href="/productos" className="boton">
            Ver todos los productos
          </Link>
        </div>

        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {PERFILES.map((perfil) => (
            <li key={perfil.id} className={`flex flex-col rounded-3xl p-8 ${ESTILO_PERFIL[perfil.id]}`}>
              <h3 className="font-display text-4xl">{perfil.plural}</h3>
              <p className="mt-3 opacity-85">{perfil.descripcion}</p>
              <ul className="mt-8 flex-1 divide-y divide-current/15 border-y border-current/15">
                {cafes
                  .filter((cafe) => cafe.perfil === perfil.id)
                  .map((cafe) => (
                    <li key={cafe.id}>
                      <Link href={`/cafes/${cafe.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                        <span>
                          <span className="block text-lg font-semibold group-hover:underline">{cafe.nombre}</span>
                          <span className="opacity-80">{cafe.notas.join(", ")}</span>
                        </span>
                        <span className="shrink-0 tabular-nums">desde {formatearPrecio(precioDesde(cafe))}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
              <Link href={`/productos#${perfil.id}`} className="mt-6 self-start font-semibold underline underline-offset-4">
                Ver los {perfil.plural.toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Diferenciación: comparación con el café de góndola */}
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

      {/* Prueba social */}
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

      <Garantias />
    </>
  );
}
