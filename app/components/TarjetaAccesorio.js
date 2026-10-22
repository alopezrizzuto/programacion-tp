import Link from "next/link";
import ImagenProducto from "./ImagenProducto";
import Estrellas from "./Estrellas";
import { precioDesde, promedioResenas } from "@/lib/productos";
import { formatearPrecio, precioTransferencia } from "@/lib/tienda";

// Misma estructura que la tarjeta de café: imagen protagonista y, abajo, lo justo para decidir
export default function TarjetaAccesorio({ accesorio }) {
  const precio = precioDesde(accesorio);

  return (
    <article className="group relative flex flex-col">
      <div className="overflow-hidden rounded-3xl">
        <ImagenProducto producto={accesorio} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col px-1 pt-4 sm:pt-5">
        {/* Las estrellas van debajo del nombre: en tarjetas angostas no entran al costado */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-lg leading-tight sm:text-xl">
            <Link href={`/accesorios/${accesorio.slug}`} className="after:absolute after:inset-0 after:rounded-3xl group-hover:underline">
              {accesorio.nombre}
            </Link>
          </h3>
          {accesorio.resenas.length > 0 && (
            <p className="flex shrink-0 items-center gap-1.5 text-sm">
              <Estrellas puntaje={promedioResenas(accesorio)} className="h-3.5 w-3.5" />
              <span>({accesorio.resenas.length})</span>
            </p>
          )}
        </div>
        <p className="mt-2 text-sm text-marron sm:text-base">{accesorio.descripcion_corta}</p>
        <p className="mt-auto pt-4">
          <strong className="font-semibold tabular-nums sm:text-lg">{formatearPrecio(precio)}</strong>
          <span className="block text-xs text-marron tabular-nums sm:text-sm">
            {formatearPrecio(precioTransferencia(precio))} con transferencia
          </span>
        </p>
      </div>
    </article>
  );
}
