import Image from "next/image";
import IconoGrano from "./IconoGrano";

// Color del grano provisorio según el tueste de cada perfil (más claro = tueste más claro)
const COLOR_POR_PERFIL = {
  frutal: "text-[#a8794f]",
  equilibrado: "text-marron",
  intenso: "text-tostado",
};

// Íconos provisorios de los accesorios, dibujados con líneas
const ICONOS_ACCESORIO = {
  vaso: (
    <>
      <path d="M14 10h36l-4 44a6 6 0 0 1-6 5H24a6 6 0 0 1-6-5z" />
      <path d="M19 15h26l-3.5 37a3 3 0 0 1-3 2.6H25.5a3 3 0 0 1-3-2.6z" opacity="0.5" />
    </>
  ),
  contenedor: (
    <>
      <rect x="16" y="18" width="32" height="40" rx="5" />
      <rect x="13" y="10" width="38" height="9" rx="3" />
      <circle cx="32" cy="14.5" r="2" />
    </>
  ),
  tamper: (
    <>
      <path d="M26 8h12v22a6 6 0 0 1-12 0z" />
      <path d="M16 36h32v6H16z" />
      <path d="M20 42h24v6a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" />
    </>
  ),
  balanza: (
    <>
      <rect x="8" y="30" width="48" height="22" rx="5" />
      <path d="M14 30v-4h36v4" />
      <rect x="24" y="38" width="16" height="8" rx="2" />
    </>
  ),
};

// Muestra la foto del producto (café o accesorio). Mientras no haya foto
// (imagen_url en null), muestra un reemplazo provisorio del mismo tamaño.
export default function ImagenProducto({ producto, sizes, priority = false, aspecto = "aspect-square" }) {
  const esCafe = producto.categoria === "cafe";

  return (
    <div className={`relative ${aspecto} overflow-hidden bg-kraft`}>
      {producto.imagen_url ? (
        <Image
          src={producto.imagen_url}
          alt={esCafe ? `Bolsa de café ${producto.nombre}` : producto.nombre}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${esCafe ? "Bolsa de café " : ""}${producto.nombre} (foto próximamente)`}
          className="flex h-full flex-col items-center justify-center gap-3"
        >
          {esCafe ? (
            <IconoGrano className={`h-1/4 w-1/4 ${COLOR_POR_PERFIL[producto.perfil]}`} />
          ) : (
            <svg
              viewBox="0 0 64 64"
              aria-hidden="true"
              className="h-1/4 w-1/4 text-tostado"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
            >
              {ICONOS_ACCESORIO[producto.icono]}
            </svg>
          )}
          <span className="font-display text-lg text-marron">{esCafe ? producto.origen : "Accesorio"}</span>
        </div>
      )}
    </div>
  );
}
