import Image from "next/image";
import IconoGrano from "./IconoGrano";

// Color del grano provisorio según el tueste de cada perfil (más claro = tueste más claro)
const COLOR_POR_PERFIL = {
  frutal: "text-[#a8794f]",
  equilibrado: "text-marron",
  intenso: "text-tostado",
};

// Muestra la foto del café. Mientras no haya foto (imagen_url en null),
// muestra un reemplazo provisorio del mismo tamaño.
export default function ImagenCafe({ cafe, sizes, priority = false, aspecto = "aspect-square" }) {
  return (
    <div className={`relative ${aspecto} overflow-hidden bg-kraft`}>
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
