import Link from "next/link";
import ImagenProducto from "./ImagenProducto";
import Estrellas from "./Estrellas";
import { ESTILO_PERFIL } from "./estilos";
import { nombrePeso, obtenerPerfil, precioDesde, promedioResenas, tieneStock } from "@/lib/productos";
import { formatearPrecio, precioTransferencia } from "@/lib/tienda";

// "250 g, 500 g y 1 kg"
function listarPesos(variantes) {
  const pesos = variantes.map((variante) => nombrePeso(variante.peso_gramos));
  return pesos.length > 1 ? `${pesos.slice(0, -1).join(", ")} y ${pesos.at(-1)}` : pesos[0];
}

// Tarjeta de café: la imagen es la protagonista (como en una tienda de diseño) y abajo va
// solo lo necesario para decidir: perfil, notas, pesos y precio.
export default function TarjetaCafe({ cafe }) {
  const desde = precioDesde(cafe);
  const perfil = obtenerPerfil(cafe.perfil);

  return (
    // "relative" + el link con after:inset-0 hacen que toda la tarjeta sea clickeable
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-3xl">
        <ImagenProducto
          producto={cafe}
          aspecto="aspect-[4/5]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <p className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-sm ${ESTILO_PERFIL[cafe.perfil]}`}>
          {perfil.nombre}
        </p>
        {!tieneStock(cafe) && (
          <p className="absolute bottom-3 left-3 rounded-full bg-tostado px-2.5 py-0.5 text-xs text-crema sm:bottom-4 sm:left-4 sm:px-3 sm:py-1 sm:text-sm">Sin stock</p>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4 sm:pt-5">
        {/* En celular (dos tarjetas por fila) las estrellas van debajo del nombre */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3 className="font-display text-lg leading-tight sm:text-2xl sm:leading-none">
            <Link href={`/cafes/${cafe.slug}`} className="after:absolute after:inset-0 after:rounded-3xl group-hover:underline">
              {cafe.nombre}
            </Link>
          </h3>
          {cafe.resenas.length > 0 && (
            <p className="flex shrink-0 items-center gap-1.5 text-sm">
              <Estrellas puntaje={promedioResenas(cafe)} className="h-3.5 w-3.5" />
              <span>({cafe.resenas.length})</span>
            </p>
          )}
        </div>
        <p className="mt-2 text-sm first-letter:uppercase sm:text-base">{cafe.notas.join(", ")}</p>
        <p className="mt-1 hidden text-sm text-marron sm:block">
          {cafe.origen}, tostado {cafe.tostado}. En {listarPesos(cafe.variantes)}.
        </p>
        <p className="mt-auto pt-4">
          Desde <strong className="font-semibold tabular-nums sm:text-lg">{formatearPrecio(desde)}</strong>
          <span className="block text-xs text-marron tabular-nums sm:text-sm">
            {formatearPrecio(precioTransferencia(desde))} con transferencia
          </span>
        </p>
      </div>
    </article>
  );
}
