import TarjetaCafe from "../components/TarjetaCafe";
import { PERFILES, obtenerCafes } from "@/lib/cafes";
import { PROMOS } from "@/lib/tienda";

export const metadata = {
  title: "Productos",
  description: "Todos nuestros cafés de especialidad, agrupados por perfil de sabor.",
};

export default function ProductosPage() {
  const cafes = obtenerCafes();

  return (
    <div id="cafes" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <h1 className="font-display text-5xl">Nuestros cafés</h1>
      <p className="mt-4 max-w-xl text-marron">
        Seis orígenes en bolsas de 250 g, 500 g y 1 kg. Llevando {PROMOS.descuentoCantidad.desdeUnidades} o más,{" "}
        {PROMOS.descuentoCantidad.porcentaje}% OFF sobre el total.
      </p>

      {/* Índice de perfiles para saltar a cada sección */}
      <nav aria-label="Perfiles" className="mt-8">
        <ul className="flex flex-wrap gap-3 text-sm">
          {PERFILES.map((perfil) => (
            <li key={perfil.id}>
              <a href={`#${perfil.id}`} className="inline-block border border-marron px-4 py-2 hover:bg-kraft">
                {perfil.nombre}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {PERFILES.map((perfil) => (
        <section key={perfil.id} id={perfil.id} aria-labelledby={`titulo-${perfil.id}`} className="mt-16 scroll-mt-24">
          <h2 id={`titulo-${perfil.id}`} className="font-display text-3xl">{perfil.nombre}</h2>
          <p className="mt-2 max-w-xl text-marron">{perfil.descripcion}</p>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {cafes
              .filter((cafe) => cafe.perfil === perfil.id)
              .map((cafe) => (
                <TarjetaCafe key={cafe.id} cafe={cafe} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
