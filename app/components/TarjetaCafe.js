import Link from "next/link";
import ImagenCafe from "./ImagenCafe";
import Estrellas from "./Estrellas";
import { obtenerPerfil, precioDesde, promedioResenas, tieneStock } from "@/lib/cafes";
import { formatearPrecio, precioTransferencia } from "@/lib/tienda";

export default function TarjetaCafe({ cafe }) {
  const desde = precioDesde(cafe);

  return (
    // "relative" + el link con after:inset-0 hacen que toda la tarjeta sea clickeable
    <article className="group relative flex flex-col">
      <ImagenCafe cafe={cafe} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
      {!tieneStock(cafe) && (
        <p className="absolute left-3 top-3 bg-espresso px-2 py-1 text-xs text-crema">Sin stock</p>
      )}

      <div className="mt-4 flex flex-1 flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-cafe">{obtenerPerfil(cafe.perfil).nombre}</p>
        <h3 className="font-serif text-2xl font-semibold">
          <Link href={`/cafes/${cafe.slug}`} className="after:absolute after:inset-0 group-hover:underline">
            {cafe.nombre}
          </Link>
        </h3>
        <p className="text-sm text-cafe">{cafe.notas.join(" · ")}</p>
        <p className="mt-1 flex items-center gap-2 text-xs text-cafe">
          <Estrellas puntaje={promedioResenas(cafe)} />
          <span>({cafe.resenas.length})</span>
        </p>
        <p className="mt-2">
          <span className="text-sm text-cafe">Desde </span>
          <span className="font-medium">{formatearPrecio(desde)}</span>
        </p>
        <p className="text-sm text-cafe">{formatearPrecio(precioTransferencia(desde))} con transferencia</p>
      </div>
    </article>
  );
}
