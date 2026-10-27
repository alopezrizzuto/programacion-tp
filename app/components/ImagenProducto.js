import Image from "next/image";
import BolsaCafe from "./BolsaCafe";

// Fondo de "estudio" parejo para todos los productos, como en una sesión de fotos:
// luz arriba al centro y más sombra hacia los bordes
const ESCENARIO = "bg-[radial-gradient(ellipse_at_50%_30%,#f8f2e8_0%,#ece0cc_60%,#e0cdb0_100%)]";

// Íconos provisorios de los accesorios (según su slug), dibujados con líneas.
// Un accesorio nuevo cargado desde el admin usa el del contenedor como genérico.
const ICONOS_ACCESORIO = {
  "vasos-doble-vidrio": (
    <>
      <path d="M14 10h36l-4 44a6 6 0 0 1-6 5H24a6 6 0 0 1-6-5z" />
      <path d="M19 15h26l-3.5 37a3 3 0 0 1-3 2.6H25.5a3 3 0 0 1-3-2.6z" opacity="0.5" />
    </>
  ),
  "contenedor-al-vacio": (
    <>
      <rect x="16" y="18" width="32" height="40" rx="5" />
      <rect x="13" y="10" width="38" height="9" rx="3" />
      <circle cx="32" cy="14.5" r="2" />
    </>
  ),
  "tamping-set": (
    <>
      <path d="M26 8h12v22a6 6 0 0 1-12 0z" />
      <path d="M16 36h32v6H16z" />
      <path d="M20 42h24v6a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" />
    </>
  ),
  "balanza-con-timer": (
    <>
      <rect x="8" y="30" width="48" height="22" rx="5" />
      <path d="M14 30v-4h36v4" />
      <rect x="24" y="38" width="16" height="8" rx="2" />
    </>
  ),
};

// Muestra la foto del producto (café o accesorio). Mientras no haya foto (imagen_url en null),
// muestra la bolsa ilustrada (cafés) o el ícono (accesorios) sobre el mismo fondo de estudio.
// "miniatura": en tamaños chicos (carrito) la bolsa va sin textos, que no se leerían.
// "completa": muestra la foto entera en lugar de recortarla para llenar el espacio (para formatos
// apaisados, donde recortar cortaría la bolsa); los bordes quedan con el mismo fondo de estudio.
export default function ImagenProducto({ producto, sizes, priority = false, aspecto = "aspect-square", miniatura = false, completa = false }) {
  const esCafe = producto.categoria === "cafe";

  return (
    <div className={`relative ${aspecto} overflow-hidden ${ESCENARIO}`}>
      {producto.imagen_url ? (
        <Image
          src={producto.imagen_url}
          alt={esCafe ? `Bolsa de café ${producto.nombre}` : producto.nombre}
          fill
          sizes={sizes}
          priority={priority}
          className={completa ? "object-contain" : "object-cover"}
        />
      ) : (
        <div
          role="img"
          aria-label={esCafe ? `Bolsa de café ${producto.nombre}` : producto.nombre}
          className="flex h-full items-center justify-center"
        >
          {esCafe ? (
            // La bolsa se levanta apenas cuando el mouse pasa por la tarjeta (group-hover)
            <BolsaCafe
              cafe={producto}
              simple={miniatura}
              className="h-[84%] w-auto transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-1"
            />
          ) : (
            <svg
              viewBox="0 0 64 64"
              aria-hidden="true"
              className={`${miniatura ? "h-1/2 w-1/2" : "h-[38%] w-[38%]"} text-tostado drop-shadow-[0_10px_8px_rgba(42,26,18,0.18)] transition-transform duration-300 ease-out group-hover:-translate-y-1.5`}
              fill="none"
              stroke="currentColor"
              strokeWidth={miniatura ? 3 : 2.2}
              strokeLinejoin="round"
            >
              {ICONOS_ACCESORIO[producto.slug] ?? ICONOS_ACCESORIO["contenedor-al-vacio"]}
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
