import Link from "next/link";
import { adminDePagina } from "@/lib/admin";
import { STOCK_BAJO } from "@/lib/tienda";

export const metadata = {
  title: "Resumen",
};

export default async function AdminPage() {
  const supabase = await adminDePagina();

  // El admin ve todos los productos (también los desactivados): lo permite RLS con es_admin()
  const [{ data: productos }, { count: pedidos }] = await Promise.all([
    supabase.from("productos").select("id, nombre, activo, variantes(id, nombre, stock)").order("id"),
    supabase.from("ordenes").select("id", { count: "exact", head: true }),
  ]);

  const variantes = productos.flatMap((producto) => producto.variantes.map((variante) => ({ ...variante, producto })));
  const sinStock = variantes.filter((variante) => variante.stock === 0);
  const paraReponer = variantes.filter((variante) => variante.stock <= STOCK_BAJO).sort((a, b) => a.stock - b.stock);

  const datos = [
    [`${productos.filter((producto) => producto.activo).length} de ${productos.length}`, "productos visibles en la tienda"],
    [sinStock.length, sinStock.length === 1 ? "variante sin stock" : "variantes sin stock"],
    [pedidos ?? 0, pedidos === 1 ? "pedido recibido" : "pedidos recibidos"],
  ];

  return (
    <div className="space-y-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Resumen</h1>
        <Link href="/admin/productos/nuevo" className="boton">
          Cargar un producto
        </Link>
      </div>

      <dl className="grid gap-5 sm:grid-cols-3">
        {datos.map(([valor, texto]) => (
          <div key={texto} className="flex flex-col-reverse rounded-3xl bg-kraft/45 p-6">
            <dt className="mt-1 text-marron">{texto}</dt>
            <dd className="font-display text-4xl tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="titulo-reponer">
        <h2 id="titulo-reponer" className="font-display text-3xl">
          Para reponer
        </h2>
        <p className="mt-2 text-marron">Variantes con {STOCK_BAJO} unidades o menos.</p>
        {paraReponer.length > 0 ? (
          <ul className="mt-6 divide-y divide-marron/20 rounded-3xl bg-kraft/45 px-6">
            {paraReponer.map((variante) => (
              <li key={variante.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <span>
                  <span className="font-semibold">{variante.producto.nombre}</span>, {variante.nombre}
                </span>
                <span className="flex items-center gap-5">
                  <span className={`tabular-nums ${variante.stock === 0 ? "font-semibold text-cereza" : ""}`}>
                    {variante.stock === 0 ? "Sin stock" : `Quedan ${variante.stock}`}
                  </span>
                  <Link href={`/admin/productos#producto-${variante.producto.id}`} className="font-semibold underline">
                    Cargar stock
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-3xl bg-kraft/45 p-6">Todo tiene stock de sobra.</p>
        )}
      </section>
    </div>
  );
}
