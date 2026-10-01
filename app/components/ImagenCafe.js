import Image from "next/image";
import IconoGrano from "./IconoGrano";

const COLOR_POR_PERFIL = {
  frutal: "text-kraft",
  equilibrado: "text-marron",
  intenso: "text-tostado",
};

// Muestra la foto del café. Mientras no haya foto (imagen_url en null),
// muestra un reemplazo provisorio del mismo tamaño.
export default function ImagenCafe({ cafe, sizes, priority = false }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-kraft">
      {cafe.imagen_url ? (
        <Image
          src={cafe.imagen_url}
          alt={`Bolsa de café ${cafe.nombre}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`Bolsa de café ${cafe.nombre} (foto próximamente)`}
          className="flex h-full flex-col items-center justify-center gap-3"
        >
          <IconoGrano className={`h-1/4 w-1/4 ${COLOR_POR_PERFIL[cafe.perfil]}`} />
          <span className="font-display text-lg text-marron">{cafe.origen}</span>
        </div>
      )}
    </div>
  );
}
