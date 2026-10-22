import TarjetaCafe from "../components/TarjetaCafe";
import TarjetaAccesorio from "../components/TarjetaAccesorio";
import Escala from "../components/Escala";
import { ESTILO_PERFIL } from "../components/estilos";
import { PERFILES } from "@/lib/productos";
import { obtenerAccesorios, obtenerCafes } from "@/lib/datos";
import { BUNDLES, PROMOS } from "@/lib/tienda";

export const metadata = {
  title: "Productos",
  description: "Cafés de especialidad agrupados por perfil de sabor y accesorios para prepararlos mejor en casa.",
};

// Acidez y cuerpo típicos de cada perfil, para mostrarlos en el encabezado de la sección
const CARACTER_PERFIL = {
  frutal: { acidez: 5, cuerpo: 2 },
  equilibrado: { acidez: 3, cuerpo: 3 },
  intenso: { acidez: 1, cuerpo: 5 },
};

export default async function ProductosPage() {
  const cafes = await obtenerCafes();
  const accesorios = await obtenerAccesorios();
  const [, dos, tres] = BUNDLES;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="font-display text-6xl leading-[0.95] sm:text-7xl">Productos</h1>
          <p className="mt-5 max-w-xl text-lg text-marron">
            Seis cafés de especialidad en bolsas de 250 g, 500 g y 1 kg, y accesorios para prepararlos mejor.
            Llevando {dos.unidades} bolsas iguales ahorrás {dos.descuento}%; llevando {tres.unidades}, {tres.descuento}%.
            Y {PROMOS.descuentoTransferencia}% más pagando por transferencia.
          </p>
        </div>
        <nav aria-label="Secciones de productos">
          <ul className="flex flex-wrap gap-2">
            {PERFILES.map((perfil) => (
              <li key={perfil.id}>
                <a href={`#${perfil.id}`} className="boton-secundario px-5 py-2.5">
                  {perfil.plural}
                </a>
              </li>
            ))}
            <li>
              <a href="#accesorios" className="boton-secundario px-5 py-2.5">
                Accesorios
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <div id="cafes" className="scroll-mt-24">
        {PERFILES.map((perfil) => (
          <section
            key={perfil.id}
            id={perfil.id}
            aria-labelledby={`titulo-${perfil.id}`}
            className="mt-16 grid scroll-mt-24 grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3"
          >
            {/* Presentación del perfil, en su color: ocupa el lugar de una tarjeta más */}
            <div className={`col-span-2 flex flex-col rounded-3xl p-7 lg:col-span-1 ${ESTILO_PERFIL[perfil.id]}`}>
              <h2 id={`titulo-${perfil.id}`} className="font-display text-4xl leading-none">
                {perfil.plural}
              </h2>
              <p className="mt-4 text-lg opacity-85">{perfil.descripcion}</p>
              <dl className="mt-auto flex flex-wrap gap-x-8 gap-y-4 pt-8 text-sm">
                <div className="w-full">
                  <dt className="opacity-80">Ideal para</dt>
                  <dd className="mt-1 font-semibold">{perfil.idealPara}</dd>
                </div>
                <div>
                  <dt className="opacity-80">Acidez</dt>
                  <dd className="mt-2"><Escala valor={CARACTER_PERFIL[perfil.id].acidez} /></dd>
                </div>
                <div>
                  <dt className="opacity-80">Cuerpo</dt>
                  <dd className="mt-2"><Escala valor={CARACTER_PERFIL[perfil.id].cuerpo} /></dd>
                </div>
              </dl>
            </div>
            {cafes
              .filter((cafe) => cafe.perfil === perfil.id)
              .map((cafe) => (
                <TarjetaCafe key={cafe.id} cafe={cafe} />
              ))}
          </section>
        ))}
      </div>

      <section
        id="accesorios"
        aria-labelledby="titulo-accesorios"
        className="mt-20 scroll-mt-24 rounded-[2rem] bg-kraft/45 px-4 py-12 sm:px-8"
      >
        <h2 id="titulo-accesorios" className="font-display text-5xl leading-none">
          Accesorios para tu café
        </h2>
        <p className="mt-3 max-w-xl text-lg text-marron">
          Lo justo para que el café rinda en casa como en una cafetería: guardarlo bien, medirlo y servirlo.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
          {accesorios.map((accesorio) => (
            <TarjetaAccesorio key={accesorio.id} accesorio={accesorio} />
          ))}
        </div>
      </section>
    </div>
  );
}
