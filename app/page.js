import Link from "next/link";
import TarjetaCafe from "./components/TarjetaCafe";
import Estrellas from "./components/Estrellas";
import IconoGrano from "./components/IconoGrano";
import { PERFILES, obtenerCafes, promedioResenas } from "@/lib/cafes";
import { PROMOS, formatearPrecio } from "@/lib/tienda";

const BENEFICIOS = [
  { titulo: "Tostado cada semana", texto: "Tu café sale con menos de 7 días de tostado." },
  { titulo: "Envío gratis", texto: `En compras desde ${formatearPrecio(PROMOS.envioGratisDesde)}.` },
  { titulo: `${PROMOS.cuotasSinInteres} cuotas sin interés`, texto: "Con todas las tarjetas, vía Mercado Pago." },
  { titulo: `${PROMOS.descuentoTransferencia}% OFF`, texto: "Pagando por transferencia bancaria." },
];

const PASOS = [
  { titulo: "Elegí tu café", texto: "Explorá los perfiles y encontrá el sabor que buscás." },
  { titulo: "Elegí peso y molienda", texto: "Bolsas de 250 g, 500 g o 1 kg, molidas para tu método." },
  { titulo: "Recibilo fresco", texto: "Lo tostamos, lo molemos y te llega en 24 a 48 h en CABA y GBA." },
];

export default function Home() {
  const cafes = obtenerCafes();
  const todasLasResenas = cafes.flatMap((cafe) => cafe.resenas);
  const promedioGeneral = todasLasResenas.reduce((suma, r) => suma + r.puntaje, 0) / todasLasResenas.length;

  // El mejor puntuado de cada perfil
  const destacados = PERFILES.map((perfil) =>
    cafes
      .filter((cafe) => cafe.perfil === perfil.id)
      .sort((a, b) => promedioResenas(b) - promedioResenas(a))[0]
  );
  const resenasDestacadas = destacados.map((cafe) => ({ ...cafe.resenas[0], cafe: cafe.nombre }));

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-xs uppercase tracking-widest text-cafe">Tostado cada semana en Buenos Aires</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight sm:text-6xl">
            Café de especialidad, elegido para tu taza
          </h1>
          <p className="mt-6 max-w-md text-lg text-cafe">
            Seis orígenes, tres perfiles de sabor y la molienda justa para tu método. Del tostador a tu casa.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/catalogo" className="bg-espresso px-6 py-3 text-crema transition-colors hover:bg-cafe">
              Ver los cafés
            </Link>
            <Link href="#perfiles" className="border border-espresso px-6 py-3 transition-colors hover:bg-beige">
              Conocé los perfiles
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-cafe">
            <Estrellas puntaje={promedioGeneral} />
            <span>
              {promedioGeneral.toLocaleString("es-AR", { maximumFractionDigits: 1 })} de promedio en{" "}
              {todasLasResenas.length} reseñas
            </span>
          </p>
        </div>
        {/* Imagen provisoria: se reemplaza por public/hero.jpg cuando esté */}
        <div aria-hidden="true" className="hidden aspect-[4/5] items-center justify-center bg-beige lg:flex">
          <IconoGrano className="h-1/3 w-1/3 text-cafe" />
        </div>
      </section>

      {/* Beneficios */}
      <section aria-labelledby="titulo-beneficios" className="border-y border-beige">
        <h2 id="titulo-beneficios" className="sr-only">Beneficios de comprar en Origen Café</h2>
        <ul className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio.titulo}>
              <p className="font-serif text-xl font-semibold">{beneficio.titulo}</p>
              <p className="mt-1 text-sm text-cafe">{beneficio.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Perfiles */}
      <section id="perfiles" aria-labelledby="titulo-perfiles" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20">
        <h2 id="titulo-perfiles" className="font-serif text-4xl font-semibold">Encontrá tu perfil</h2>
        <p className="mt-3 max-w-xl text-cafe">
          Agrupamos nuestros cafés según cómo se sienten en la taza, para que elegir sea fácil.
        </p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {PERFILES.map((perfil) => (
            <li key={perfil.id} className="flex flex-col bg-beige p-8">
              <h3 className="font-serif text-2xl font-semibold">{perfil.nombre}</h3>
              <p className="mt-3 flex-1 text-cafe">{perfil.descripcion}</p>
              <Link href={`/catalogo#${perfil.id}`} className="mt-6 self-start border-b border-espresso hover:border-cafe">
                Ver cafés {perfil.nombre.toLowerCase()}
                <span aria-hidden="true"> →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo funciona */}
      <section aria-labelledby="titulo-pasos" className="bg-espresso text-crema">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 id="titulo-pasos" className="font-serif text-4xl font-semibold">Cómo funciona</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo}>
                <p aria-hidden="true" className="font-serif text-5xl text-caramelo">0{i + 1}</p>
                <h3 className="mt-3 text-lg font-medium">{paso.titulo}</h3>
                <p className="mt-2 text-beige">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Destacados */}
      <section aria-labelledby="titulo-destacados" className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="titulo-destacados" className="font-serif text-4xl font-semibold">Los más elegidos</h2>
          <Link href="/catalogo" className="border-b border-espresso hover:border-cafe">
            Ver todo el catálogo<span aria-hidden="true"> →</span>
          </Link>
        </div>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((cafe) => (
            <TarjetaCafe key={cafe.id} cafe={cafe} />
          ))}
        </div>
      </section>

      {/* Reseñas */}
      <section aria-labelledby="titulo-resenas" className="bg-beige">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 id="titulo-resenas" className="font-serif text-4xl font-semibold">Lo que dicen quienes ya lo probaron</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {resenasDestacadas.map((resena) => (
              <li key={resena.autor}>
                <figure className="flex h-full flex-col bg-crema p-8">
                  <Estrellas puntaje={resena.puntaje} />
                  <blockquote className="mt-4 flex-1 font-serif text-xl">“{resena.texto}”</blockquote>
                  <figcaption className="mt-6 text-sm text-cafe">
                    {resena.autor} · compró {resena.cafe}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Llamado final */}
      <section aria-labelledby="titulo-cantidad" className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 id="titulo-cantidad" className="font-serif text-4xl font-semibold">
          Llevá {PROMOS.descuentoCantidad.desdeUnidades} bolsas o más y ahorrá {PROMOS.descuentoCantidad.porcentaje}%
        </h2>
        <p className="mt-4 text-cafe">Combiná orígenes como quieras: el descuento se aplica sobre el total.</p>
        <Link href="/catalogo" className="mt-8 inline-block bg-espresso px-6 py-3 text-crema transition-colors hover:bg-cafe">
          Armar mi pedido
        </Link>
      </section>
    </>
  );
}
