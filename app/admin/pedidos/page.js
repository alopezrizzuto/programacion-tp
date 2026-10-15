import Link from "next/link";
import CambiarEstado from "./CambiarEstado";
import { adminDePagina } from "@/lib/admin";
import { ESTADOS } from "@/lib/ordenes";
import { formatearPrecio } from "@/lib/tienda";

export const metadata = {
  title: "Pedidos",
};

const FILTROS = [
  { id: "preparar", nombre: "Para preparar", estados: ["pagada"] },
  { id: "pago", nombre: "Esperando pago", estados: ["pendiente", "rechazada"] },
  { id: "enviados", nombre: "Enviados", estados: ["enviada", "entregada"] },
  { id: "todos", nombre: "Todos", estados: Object.keys(ESTADOS) },
];

const COLOR_ESTADO = { bien: "bg-tostado text-crema", mal: "bg-cereza text-crema", neutro: "bg-kraft text-tostado" };

// ?filtro=preparar|pago|enviados|todos
export default async function AdminPedidosPage({ searchParams }) {
  const supabase = await adminDePagina();
  const { filtro: elegido } = await searchParams;
  const filtro = FILTROS.find((f) => f.id === elegido) ?? FILTROS[0];

  // RLS deja al admin ver todos los pedidos (es_admin en la política de ordenes)
  const { data: ordenes } = await supabase
    .from("ordenes")
    .select("*, orden_items(id, descripcion, molienda, cantidad)")
    .in("estado", filtro.estados)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="font-display text-5xl">Pedidos</h1>

      <nav aria-label="Filtrar pedidos" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <li key={f.id}>
              <Link
                href={`/admin/pedidos?filtro=${f.id}`}
                aria-current={f.id === filtro.id ? "page" : undefined}
                className={`block rounded-full border-[1.5px] px-4 py-2 font-semibold ${
                  f.id === filtro.id ? "border-tostado bg-tostado text-crema" : "border-marron/30 hover:border-tostado"
                }`}
              >
                {f.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {ordenes.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-kraft/45 p-6">No hay pedidos en &quot;{filtro.nombre}&quot;.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {ordenes.map((orden) => (
            <li key={orden.id} className="rounded-3xl bg-kraft/45 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-3">
                    <Link href={`/seguimiento/${orden.codigo}`} className="font-display text-xl underline-offset-2 hover:underline">
                      {orden.codigo}
                    </Link>
                    <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${COLOR_ESTADO[ESTADOS[orden.estado].tono]}`}>
                      {ESTADOS[orden.estado].nombre}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-marron">
                    {new Date(orden.created_at).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Argentina/Buenos_Aires",
                    })}
                    {", "}
                    {orden.envio_nombre} ({orden.email}){orden.user_id ? "" : ", sin cuenta"}
                  </p>
                </div>
                <p className="text-right">
                  <span className="block font-semibold tabular-nums">{formatearPrecio(orden.total)}</span>
                  <span className="text-sm text-marron">{orden.medio_pago === "mercadopago" ? "Mercado Pago" : "Transferencia"}</span>
                </p>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">
                  {orden.orden_items.reduce((suma, item) => suma + item.cantidad, 0)} productos y datos de envío
                </summary>
                <div className="mt-3 grid gap-6 sm:grid-cols-2">
                  <ul className="space-y-1">
                    {orden.orden_items.map((item) => (
                      <li key={item.id}>
                        {item.cantidad} x {item.descripcion}
                        {item.molienda && <span className="text-marron">, molienda {item.molienda}</span>}
                      </li>
                    ))}
                  </ul>
                  <address className="not-italic">
                    {orden.envio_direccion}
                    <br />
                    {orden.envio_ciudad}, {orden.envio_provincia} ({orden.envio_codigo_postal})
                    <br />
                    Tel. {orden.envio_telefono}
                  </address>
                </div>
              </details>

              <div className="mt-4">
                <CambiarEstado orden={{ id: orden.id, codigo: orden.codigo, estado: orden.estado }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
