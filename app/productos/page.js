import Link from "next/link";
import TarjetaCafe from "../components/TarjetaCafe";
import TarjetaAccesorio from "../components/TarjetaAccesorio";
import Escala from "../components/Escala";
import { ESTILO_PERFIL } from "../components/estilos";
import FiltrosCatalogo from "./FiltrosCatalogo";
import { PERFILES } from "@/lib/productos";
import { obtenerProductos } from "@/lib/datos";
import { aParametros, filtrarProductos, hayFiltros, leerFiltros, paisesDeOrigen } from "@/lib/catalogo";
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

// "3 cafés y 1 accesorio"
function contarResultados(cafes, accesorios) {
  const partes = [];
  if (cafes > 0) partes.push(`${cafes} ${cafes === 1 ? "café" : "cafés"}`);
  if (accesorios > 0) partes.push(`${accesorios} ${accesorios === 1 ? "accesorio" : "accesorios"}`);
  return partes.join(" y ");
}

// Catálogo con búsqueda y filtros. Los filtros llegan en la URL (searchParams); la página se arma
// en el servidor con lo que corresponde, usando las mismas funciones que GET /api/productos (lib/catalogo.js).
export default async function ProductosPage({ searchParams }) {
  const productos = await obtenerProductos();
  const paises = paisesDeOrigen(productos);
  // Lo que no es válido se ignora y se avisa en el panel (la API, en cambio, responde 400)
  const { filtros, errores } = leerFiltros(aParametros(await searchParams), { paises });
  const encontrados = filtrarProductos(productos, filtros);
  const cafes = encontrados.filter((producto) => producto.categoria === "cafe");
  const accesorios = encontrados.filter((producto) => producto.categoria === "accesorio");
  const filtrando = hayFiltros(filtros);
  const cantidadActivos =
    ["perfil", "tostado", "acidez", "cuerpo", "origen", "peso"].reduce((total, clave) => total + filtros[clave].length, 0) +
    [filtros.q !== "", filtros.precioMin !== null, filtros.precioMax !== null, filtros.conStock].filter(Boolean).length;
  const [, dos, tres] = BUNDLES;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <header>
        <h1 className="font-display text-6xl leading-[0.95] sm:text-7xl">Productos</h1>
        <p className="mt-5 max-w-xl text-lg text-marron">
          Seis cafés de especialidad en bolsas de 250 g, 500 g y 1 kg, y accesorios para prepararlos mejor.
          Llevando {dos.unidades} bolsas iguales ahorrás {dos.descuento}%; llevando {tres.unidades}, {tres.descuento}%.
          Y {PROMOS.descuentoTransferencia}% más pagando por transferencia.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <FiltrosCatalogo filtros={filtros} errores={errores} paises={paises} cantidadActivos={cantidadActivos} />

        <div>
          {/* role="status": cuando cambian los filtros, el lector de pantalla anuncia cuántos resultados hay */}
          <p role="status" className="text-lg text-marron">
            {encontrados.length === 0
              ? "No encontramos productos con esos filtros."
              : filtrando
                ? `Encontramos ${contarResultados(cafes.length, accesorios.length)}.`
                : `Todos nuestros productos: ${contarResultados(cafes.length, accesorios.length)}.`}
          </p>
          {encontrados.length === 0 && (
            <div className="mt-6 rounded-3xl bg-kraft/45 p-8">
              <p className="font-display text-2xl">Probá con menos filtros</p>
              <p className="mt-2 text-marron">O hacé el test y te recomendamos un café según cómo lo tomás.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/productos" className="boton">Ver todos los productos</Link>
                <Link href="/#elegi" className="boton-secundario">Hacer el test</Link>
              </div>
            </div>
          )}

          <div id="cafes" className="scroll-mt-24">
            {PERFILES.filter((perfil) => cafes.some((cafe) => cafe.perfil === perfil.id)).map((perfil) => (
              <section
                key={perfil.id}
                id={perfil.id}
                aria-labelledby={`titulo-${perfil.id}`}
                className="mt-10 grid scroll-mt-24 grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3"
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

          {accesorios.length > 0 && (
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
              <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 xl:grid-cols-4">
                {accesorios.map((accesorio) => (
                  <TarjetaAccesorio key={accesorio.id} accesorio={accesorio} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
