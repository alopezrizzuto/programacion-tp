import Link from "next/link";
import ImagenProducto from "./ImagenProducto";
import Estrellas from "./Estrellas";
import Escala from "./Escala";
import { ESTILO_PERFIL } from "./estilos";
import { precioDesde, promedioResenas, tieneStock } from "@/lib/cafes";
import { formatearPrecio, precioTransferencia } from "@/lib/tienda";

// Tarjeta de café pensada como la etiqueta de la bolsa: origen, nombre, notas y una mini ficha.
// "horizontal": en pantallas grandes pone la imagen a la izquierda (se usa en /productos).
export default function TarjetaCafe({ cafe, horizontal = false }) {
  const desde = precioDesde(cafe);

  return (
    // "relative" + el link con after:inset-0 hacen que toda la tarjeta sea clickeable
    <article
      className={`group relative flex flex-col rounded-3xl p-3 ${horizontal ? "lg:flex-row" : ""} ${ESTILO_PERFIL[cafe.perfil]}`}
    >
      <div className={`relative overflow-hidden rounded-2xl ${horizontal ? "lg:w-[44%] lg:shrink-0 lg:self-start" : ""}`}>
        <ImagenProducto producto={cafe} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        {!tieneStock(cafe) && (
          <p className="absolute left-3 top-3 rounded-full bg-tostado px-3 py-1 text-sm text-crema">Sin stock</p>
        )}
      </div>

      <div className={`flex flex-1 flex-col px-3 pb-3 pt-5 ${horizontal ? "lg:pl-6 lg:pt-3" : ""}`}>
        <p className="opacity-80">
          {cafe.origen}, {cafe.region}
        </p>
        <h3 className="mt-1 font-display text-3xl leading-none">
          <Link href={`/cafes/${cafe.slug}`} className="after:absolute after:inset-0 after:rounded-3xl group-hover:underline">
            {cafe.nombre}
          </Link>
        </h3>
        <p className="mt-2 first-letter:uppercase">{cafe.notas.join(", ")}</p>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-current/15 py-4 text-sm">
          <div>
            <dt className="opacity-80">Tostado</dt>
            <dd className="mt-1 font-semibold first-letter:uppercase">{cafe.tostado}</dd>
          </div>
          <div>
            <dt className="opacity-80">Acidez</dt>
            <dd className="mt-2"><Escala valor={cafe.acidez} ancho="w-3" /></dd>
          </div>
          <div>
            <dt className="opacity-80">Cuerpo</dt>
            <dd className="mt-2"><Escala valor={cafe.cuerpo} ancho="w-3" /></dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p>
              Desde <strong className="text-lg font-semibold">{formatearPrecio(desde)}</strong>
            </p>
            <p className="opacity-80">{formatearPrecio(precioTransferencia(desde))} con transferencia</p>
          </div>
          <p className="flex items-center gap-1.5 text-sm">
            <Estrellas puntaje={promedioResenas(cafe)} className="h-3.5 w-3.5" />
            <span>({cafe.resenas.length})</span>
          </p>
        </div>
      </div>
    </article>
  );
}
