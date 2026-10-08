import Link from "next/link";
import { notFound } from "next/navigation";
import ImagenProducto from "../../components/ImagenProducto";
import Estrellas from "../../components/Estrellas";
import Escala from "../../components/Escala";
import TarjetaCafe from "../../components/TarjetaCafe";
import TarjetaAccesorio from "../../components/TarjetaAccesorio";
import FechaEntrega from "../../components/FechaEntrega";
import Garantias from "../../components/Garantias";
import VideosClientes from "../../components/VideosClientes";
import Resenas from "../../components/Resenas";
import BarraEstadisticas from "../../components/BarraEstadisticas";
import PreguntasFrecuentes from "../../components/PreguntasFrecuentes";
import SelectorCompra from "./SelectorCompra";
import { nombrePeso, obtenerCafePorSlug, obtenerCafes, obtenerPerfil, promedioResenas } from "@/lib/cafes";
import { obtenerAccesorios } from "@/lib/accesorios";
import { FAQ_CAFE } from "@/lib/preguntas-frecuentes";

// Le dice a Next qué slugs existen, para generar las 6 páginas al compilar
export function generateStaticParams() {
  return obtenerCafes().map((cafe) => ({ slug: cafe.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cafe = obtenerCafePorSlug(slug);
  if (!cafe) return { title: "Café no encontrado" };
  return { title: cafe.nombre, description: cafe.descripcion };
}

export default async function CafePage({ params }) {
  // En Next 16 los params llegan como promesa: hay que esperarlos con await
  const { slug } = await params;
  const cafe = obtenerCafePorSlug(slug);
  if (!cafe) notFound();

  const perfil = obtenerPerfil(cafe.perfil);
  const promedio = promedioResenas(cafe);
  const cafes = obtenerCafes();
  // Para completar el pedido: el otro café del mismo perfil y dos accesorios
  const otroDelPerfil = cafes.find((otro) => otro.perfil === cafe.perfil && otro.id !== cafe.id);
  const accesorios = obtenerAccesorios().filter((a) => ["contenedor-al-vacio", "balanza-con-timer"].includes(a.slug));

  const beneficios = [
    `notas a ${cafe.notas.join(", ")}`,
    "tostado esta semana: te llega con menos de 7 días",
    "molido a pedido para tu cafetera, o en grano",
  ];

  const especificaciones = [
    ["Origen", cafe.origen],
    ["Región", cafe.region],
    ["Altura", cafe.altura],
    ["Proceso", cafe.proceso],
    ["Variedad", cafe.variedad],
    ["Tostado", cafe.tostado],
    ["Notas", cafe.notas.join(", ")],
    ["Pesos", cafe.variantes.map((v) => nombrePeso(v.peso_gramos)).join(", ")],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Ruta de navegación" className="text-marron">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/" className="hover:underline">Inicio</Link> /</li>
          <li><Link href="/productos" className="hover:underline">Productos</Link> /</li>
          <li><Link href={`/productos#${perfil.id}`} className="hover:underline">{perfil.plural}</Link> /</li>
          <li aria-current="page" className="text-tostado">{cafe.nombre}</li>
        </ol>
      </nav>

      {/* Imagen + columna de compra */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl">
            <ImagenProducto producto={cafe} sizes="(min-width: 1024px) 50vw, 100vw" priority />
          </div>
        </div>

        <div>
          <p className="text-marron">
            {perfil.nombre}, de {cafe.origen}
          </p>
          <h1 className="mt-1 font-display text-5xl leading-[0.95] sm:text-6xl">{cafe.nombre}</h1>
          <a href="#resenas" className="mt-4 inline-flex items-center gap-2 hover:underline">
            <Estrellas puntaje={promedio} />
            {promedio.toLocaleString("es-AR", { maximumFractionDigits: 1 })} ({cafe.resenas.length} reseñas)
          </a>
          <p className="mt-5 text-lg text-marron">{cafe.descripcion}</p>

          <SelectorCompra cafe={cafe} beneficios={beneficios} promedio={promedio} />

          <div className="mt-8 space-y-8 border-t border-marron/20 pt-8">
            <FechaEntrega />
            <Garantias compacta />
            <VideosClientes />
          </div>
        </div>
      </div>

      <div className="mt-24 space-y-24">
        {/* Beneficios principales */}
        <section aria-labelledby="titulo-beneficios">
          <h2 id="titulo-beneficios" className="font-display text-4xl leading-none sm:text-5xl">
            Por qué te va a gustar
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            <li className="rounded-3xl bg-kraft/45 p-7">
              <h3 className="text-xl font-semibold">Un sabor que se reconoce</h3>
              <p className="mt-2 text-marron">
                Notas a {cafe.notas.join(", ")}. {perfil.descripcion}
              </p>
            </li>
            <li className="rounded-3xl bg-kraft/45 p-7">
              <h3 className="text-xl font-semibold">Fresco de verdad</h3>
              <p className="mt-2 text-marron">
                Lo tostamos cada semana y lo despachamos con menos de 7 días de tostado, con la fecha impresa en la bolsa.
              </p>
            </li>
            <li className="rounded-3xl bg-kraft/45 p-7">
              <h3 className="text-xl font-semibold">Sabés de dónde viene</h3>
              <p className="mt-2 text-marron">
                De {cafe.region}, {cafe.origen}, cultivado entre {cafe.altura} de altura con proceso{" "}
                {cafe.proceso.toLowerCase()}.
              </p>
            </li>
          </ul>
        </section>

        {/* Tabla comparativa */}
        <section aria-labelledby="titulo-comparativa">
          <h2 id="titulo-comparativa" className="font-display text-4xl leading-none sm:text-5xl">
            Compará con los otros cafés
          </h2>
          {/* overflow-x-auto: en celular la tabla se desliza de costado sin romper la página.
              relative: contiene a los textos ocultos (sr-only, que son absolute) para que no se escapen */}
          <div className="relative mt-10 overflow-x-auto rounded-3xl ring-1 ring-marron/20">
            <table className="w-full min-w-[40rem] text-left">
              <caption className="sr-only">Comparación de {cafe.nombre} con los otros cafés de la tienda</caption>
              <thead className="bg-kraft/45">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">Café</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Tostado</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Acidez</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Cuerpo</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Ideal para</th>
                </tr>
              </thead>
              <tbody>
                {cafes.map((otro) => {
                  const actual = otro.id === cafe.id;
                  return (
                    <tr key={otro.id} className={`border-t border-marron/15 ${actual ? "bg-tostado text-crema" : ""}`}>
                      <th scope="row" className="px-5 py-4 font-semibold">
                        {actual ? (
                          <>
                            {otro.nombre} <span className="font-normal text-kraft">(este café)</span>
                          </>
                        ) : (
                          <Link href={`/cafes/${otro.slug}`} className="underline-offset-2 hover:underline">
                            {otro.nombre}
                          </Link>
                        )}
                      </th>
                      <td className="px-5 py-4 first-letter:uppercase">{otro.tostado}</td>
                      <td className="px-5 py-4"><Escala valor={otro.acidez} /></td>
                      <td className="px-5 py-4"><Escala valor={otro.cuerpo} /></td>
                      <td className="px-5 py-4">{obtenerPerfil(otro.perfil).idealPara}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Especificaciones */}
        <section aria-labelledby="titulo-especificaciones" className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="titulo-especificaciones" className="font-display text-4xl leading-none sm:text-5xl">
            Ficha del café
          </h2>
          <dl className="grid gap-x-10 sm:grid-cols-2">
            {especificaciones.map(([dato, valor]) => (
              <div key={dato} className="flex justify-between gap-6 border-b border-marron/20 py-4">
                <dt className="text-marron">{dato}</dt>
                <dd className="text-right font-semibold first-letter:uppercase">{valor}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-6 border-b border-marron/20 py-4">
              <dt className="text-marron">Acidez</dt>
              <dd><Escala valor={cafe.acidez} /></dd>
            </div>
            <div className="flex items-center justify-between gap-6 border-b border-marron/20 py-4">
              <dt className="text-marron">Cuerpo</dt>
              <dd><Escala valor={cafe.cuerpo} /></dd>
            </div>
          </dl>
        </section>

        <Resenas producto={cafe} />
        <BarraEstadisticas producto={cafe} />
        <PreguntasFrecuentes preguntas={FAQ_CAFE} />

        <section aria-labelledby="titulo-completa">
          <h2 id="titulo-completa" className="font-display text-4xl leading-none sm:text-5xl">
            Completá tu pedido
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {otroDelPerfil && <TarjetaCafe cafe={otroDelPerfil} />}
            {accesorios.map((accesorio) => (
              <TarjetaAccesorio key={accesorio.id} accesorio={accesorio} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
