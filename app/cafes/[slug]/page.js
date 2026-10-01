import Link from "next/link";
import { notFound } from "next/navigation";
import ImagenCafe from "../../components/ImagenCafe";
import Estrellas from "../../components/Estrellas";
import TarjetaCafe from "../../components/TarjetaCafe";
import SelectorCompra from "./SelectorCompra";
import { obtenerCafePorSlug, obtenerCafes, obtenerPerfil, promedioResenas } from "@/lib/cafes";
import { ENVIOS, PROMOS, formatearPrecio } from "@/lib/tienda";

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

// Escala de 1 a 5 dibujada con segmentos; el texto para lectores de pantalla va aparte
function Nivel({ valor }) {
  return (
    <>
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`h-1.5 w-6 ${n <= valor ? "bg-cafe" : "bg-beige"}`} />
        ))}
      </span>
      <span className="sr-only">{valor} de 5</span>
    </>
  );
}

export default async function CafePage({ params }) {
  // En Next 16 los params llegan como promesa: hay que esperarlos con await
  const { slug } = await params;
  const cafe = obtenerCafePorSlug(slug);
  if (!cafe) notFound();

  const perfil = obtenerPerfil(cafe.perfil);
  const promedio = promedioResenas(cafe);
  // Primero los del mismo perfil, después el resto
  const relacionados = obtenerCafes()
    .filter((otro) => otro.id !== cafe.id)
    .sort((a, b) => (b.perfil === cafe.perfil) - (a.perfil === cafe.perfil))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Ruta de navegación" className="text-sm text-cafe">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/" className="hover:underline">Inicio</Link> /</li>
          <li><Link href="/catalogo" className="hover:underline">Catálogo</Link> /</li>
          <li aria-current="page" className="text-espresso">{cafe.nombre}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ImagenCafe cafe={cafe} sizes="(min-width: 1024px) 50vw, 100vw" priority />

        <div>
          <p className="text-xs uppercase tracking-widest text-cafe">{perfil.nombre}</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">{cafe.nombre}</h1>
          <a href="#resenas" className="mt-3 inline-flex items-center gap-2 text-sm text-cafe hover:underline">
            <Estrellas puntaje={promedio} />
            {cafe.resenas.length} reseñas
          </a>
          <p className="mt-6 text-cafe">{cafe.descripcion}</p>

          <SelectorCompra cafe={cafe} />
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="titulo-ficha" className="bg-beige p-8">
          <h2 id="titulo-ficha" className="font-serif text-2xl font-semibold">Ficha del café</h2>
          <dl className="mt-6 grid grid-cols-[7rem_1fr] items-center gap-y-4 text-sm">
            <dt className="text-cafe">Origen</dt>
            <dd>{cafe.origen}</dd>
            <dt className="text-cafe">Tostado</dt>
            <dd className="first-letter:uppercase">{cafe.tostado}</dd>
            <dt className="text-cafe">Acidez</dt>
            <dd><Nivel valor={cafe.acidez} /></dd>
            <dt className="text-cafe">Cuerpo</dt>
            <dd><Nivel valor={cafe.cuerpo} /></dd>
            <dt className="text-cafe">Notas</dt>
            <dd className="first-letter:uppercase">{cafe.notas.join(", ")}</dd>
          </dl>
        </section>

        <section aria-labelledby="titulo-envios" className="border border-beige p-8">
          <h2 id="titulo-envios" className="font-serif text-2xl font-semibold">Envío y frescura</h2>
          <ul className="mt-6 space-y-3 text-sm">
            {ENVIOS.map((envio) => (
              <li key={envio.zona}>
                <span className="font-medium">{envio.zona}:</span> <span className="text-cafe">{envio.plazo}</span>
              </li>
            ))}
            <li>
              <span className="font-medium">Envío gratis</span>{" "}
              <span className="text-cafe">en compras desde {formatearPrecio(PROMOS.envioGratisDesde)}</span>
            </li>
            <li>
              <span className="font-medium">Tostado esta semana:</span>{" "}
              <span className="text-cafe">molemos y despachamos con menos de 7 días de tostado.</span>
            </li>
          </ul>
        </section>
      </div>

      <section id="resenas" aria-labelledby="titulo-resenas" className="mt-20 scroll-mt-8">
        <h2 id="titulo-resenas" className="font-serif text-3xl font-semibold">Reseñas</h2>
        <p className="mt-3 flex items-center gap-3 text-cafe">
          <Estrellas puntaje={promedio} className="h-5 w-5" />
          {promedio.toLocaleString("es-AR", { maximumFractionDigits: 1 })} de 5 · {cafe.resenas.length} reseñas
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {cafe.resenas.map((resena) => (
            <li key={resena.autor} className="border border-beige p-6">
              <Estrellas puntaje={resena.puntaje} />
              <p className="mt-3">{resena.texto}</p>
              <p className="mt-4 text-sm text-cafe">{resena.autor}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-relacionados" className="mt-20">
        <h2 id="titulo-relacionados" className="font-serif text-3xl font-semibold">También te puede gustar</h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {relacionados.map((otro) => (
            <TarjetaCafe key={otro.id} cafe={otro} />
          ))}
        </div>
      </section>
    </div>
  );
}
