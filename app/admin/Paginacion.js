import Link from "next/link";

// Paginación de las listas del admin (Mensajes y Pedidos).
// Auditoría de seguridad: antes cada lista mostraba solo los 100 más nuevos y no había forma de ver
// los anteriores, así que cualquiera podía tapar mensajes o pedidos reales mandando 100 de mentira.
// Ahora se navega por páginas y ningún registro queda fuera de alcance.

export const POR_PAGINA = 30;

// ?pagina=3 → 3 (cualquier otra cosa → 1)
export function leerPagina(valor) {
  const pagina = Number(valor);
  return Number.isInteger(pagina) && pagina > 1 ? pagina : 1;
}

// Filas a pedirle a Supabase (.range es inclusivo): se pide una de más para saber si hay otra página
export function rangoDePagina(pagina) {
  const desde = (pagina - 1) * POR_PAGINA;
  return [desde, desde + POR_PAGINA];
}

// filas: lo que devolvió la consulta. Devuelve las de esta página y si hay más
export function cortarPagina(filas) {
  return { visibles: filas.slice(0, POR_PAGINA), hayMas: filas.length > POR_PAGINA };
}

// hrefDe(n): arma el link a la página n conservando los demás filtros
export default function Paginacion({ pagina, hayMas, hrefDe }) {
  if (pagina === 1 && !hayMas) return null;
  return (
    <nav aria-label="Páginas" className="mt-8 flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <Link href={hrefDe(pagina - 1)} className="boton-secundario py-2">
          Más nuevos
        </Link>
      ) : (
        <span />
      )}
      <span className="text-marron">Página {pagina}</span>
      {hayMas ? (
        <Link href={hrefDe(pagina + 1)} className="boton-secundario py-2">
          Anteriores
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
