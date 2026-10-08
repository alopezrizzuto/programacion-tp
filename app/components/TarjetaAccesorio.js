import Link from "next/link";
import ImagenProducto from "./ImagenProducto";
import Estrellas from "./Estrellas";
import { precioDesde, promedioResenas } from "@/lib/productos";
import { formatearPrecio, precioTransferencia } from "@/lib/tienda";

export default function TarjetaAccesorio({ accesorio }) {
  const precio = precioDesde(accesorio);

  return (
    <article className="group relative flex flex-col rounded-3xl bg-crema p-3 ring-1 ring-inset ring-marron/25">
      <div className="overflow-hidden rounded-2xl">
        <ImagenProducto producto={accesorio} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <h3 className="font-display text-2xl leading-none">
          <Link href={`/accesorios/${accesorio.slug}`} className="after:absolute after:inset-0 after:rounded-3xl group-hover:underline">
            {accesorio.nombre}
          </Link>
        </h3>
        <p className="mt-2 text-marron">{accesorio.descripcion_corta}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-lg font-semibold">{formatearPrecio(precio)}</p>
            <p className="text-marron">{formatearPrecio(precioTransferencia(precio))} con transferencia</p>
          </div>
          {accesorio.resenas.length > 0 && (
            <p className="flex items-center gap-1.5 text-sm">
              <Estrellas puntaje={promedioResenas(accesorio)} className="h-3.5 w-3.5" />
              <span>({accesorio.resenas.length})</span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
