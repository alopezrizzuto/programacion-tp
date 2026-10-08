import Link from "next/link";
import { notFound } from "next/navigation";
import ImagenProducto from "../../components/ImagenProducto";
import Estrellas from "../../components/Estrellas";
import TarjetaCafe from "../../components/TarjetaCafe";
import TarjetaAccesorio from "../../components/TarjetaAccesorio";
import FechaEntrega from "../../components/FechaEntrega";
import Garantias from "../../components/Garantias";
import Resenas from "../../components/Resenas";
import PreguntasFrecuentes from "../../components/PreguntasFrecuentes";
import SelectorAccesorio from "./SelectorAccesorio";
import { obtenerCafes, promedioResenas } from "@/lib/cafes";
import { obtenerAccesorioPorSlug, obtenerAccesorios } from "@/lib/accesorios";
import { FAQ_ACCESORIO } from "@/lib/preguntas-frecuentes";

// Misma lógica que la página de café: Next genera una página por accesorio al compilar
export function generateStaticParams() {
  return obtenerAccesorios().map((accesorio) => ({ slug: accesorio.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const accesorio = obtenerAccesorioPorSlug(slug);
  if (!accesorio) return { title: "Accesorio no encontrado" };
  return { title: accesorio.nombre, description: accesorio.corta };
}

export default async function AccesorioPage({ params }) {
  const { slug } = await params;
  const accesorio = obtenerAccesorioPorSlug(slug);
  if (!accesorio) notFound();

  const promedio = promedioResenas(accesorio);
  const otrosAccesorios = obtenerAccesorios().filter((otro) => otro.id !== accesorio.id).slice(0, 2);
  // El café mejor valorado, para sugerirlo junto al accesorio
  const cafeSugerido = [...obtenerCafes()].sort((a, b) => promedioResenas(b) - promedioResenas(a))[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Ruta de navegación" className="text-marron">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/" className="hover:underline">Inicio</Link> /</li>
          <li><Link href="/productos" className="hover:underline">Productos</Link> /</li>
          <li><Link href="/productos#accesorios" className="hover:underline">Accesorios</Link> /</li>
          <li aria-current="page" className="text-tostado">{accesorio.nombre}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl">
            <ImagenProducto producto={accesorio} sizes="(min-width: 1024px) 50vw, 100vw" priority />
          </div>
        </div>

        <div>
          <p className="text-marron">Accesorio</p>
          <h1 className="mt-1 font-display text-5xl leading-[0.95] sm:text-6xl">{accesorio.nombre}</h1>
          <a href="#resenas" className="mt-4 inline-flex items-center gap-2 hover:underline">
            <Estrellas puntaje={promedio} />
            {promedio.toLocaleString("es-AR", { maximumFractionDigits: 1 })} ({accesorio.resenas.length} reseñas)
          </a>
          <p className="mt-5 text-lg text-marron">{accesorio.descripcion}</p>

          <ul className="mt-6 space-y-2">
            {accesorio.beneficios.map((beneficio) => (
              <li key={beneficio} className="flex gap-3">
                <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {beneficio}
              </li>
            ))}
          </ul>

          <SelectorAccesorio accesorio={accesorio} />

          <div className="mt-8 space-y-8 border-t border-marron/20 pt-8">
            <FechaEntrega />
            <Garantias compacta />
          </div>
        </div>
      </div>

      <div className="mt-24 space-y-24">
        <section aria-labelledby="titulo-especificaciones" className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="titulo-especificaciones" className="font-display text-4xl leading-none sm:text-5xl">
            Especificaciones
          </h2>
          <dl>
            {accesorio.especificaciones.map(([dato, valor]) => (
              <div key={dato} className="flex justify-between gap-6 border-b border-marron/20 py-4">
                <dt className="text-marron">{dato}</dt>
                <dd className="text-right font-semibold">{valor}</dd>
              </div>
            ))}
          </dl>
        </section>

        <Resenas producto={accesorio} />
        <PreguntasFrecuentes preguntas={FAQ_ACCESORIO} />

        <section aria-labelledby="titulo-combina">
          <h2 id="titulo-combina" className="font-display text-4xl leading-none sm:text-5xl">
            Combinalo con
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <TarjetaCafe cafe={cafeSugerido} />
            {otrosAccesorios.map((otro) => (
              <TarjetaAccesorio key={otro.id} accesorio={otro} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
