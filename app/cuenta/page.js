import Link from "next/link";
import { redirect } from "next/navigation";
import BotonSalir from "./BotonSalir";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearPrecio } from "@/lib/tienda";

export const metadata = {
  title: "Mi cuenta",
};

const ESTADOS = {
  pendiente: "Pendiente de pago",
  pagada: "Pagada",
  rechazada: "Pago rechazado",
  cancelada: "Cancelada",
};

// Página del servidor y dinámica: lee la sesión de las cookies, así que se arma en cada visita.
export default async function CuentaPage() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Sin sesión no hay nada que mostrar: a ingresar, y después se vuelve acá
  if (!user) redirect("/ingresar?siguiente=/cuenta");

  // Las dos consultas salen juntas. RLS ya limita todo a lo del usuario conectado.
  const [{ data: perfil }, { data: ordenes }] = await Promise.all([
    supabase.from("profiles").select("nombre").eq("id", user.id).single(),
    supabase
      .from("ordenes")
      .select("id, estado, total, created_at, orden_items(cantidad)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-5xl">Hola, {perfil?.nombre || "de nuevo"}</h1>
          <p className="mt-3 text-marron">{user.email}</p>
        </div>
        <BotonSalir />
      </div>

      <section aria-labelledby="titulo-pedidos" className="mt-14">
        <h2 id="titulo-pedidos" className="font-display text-3xl">
          Mis pedidos
        </h2>

        {ordenes?.length ? (
          <ul className="mt-6 divide-y divide-marron/20 rounded-3xl bg-kraft/45 px-6">
            {ordenes.map((orden) => {
              const unidades = orden.orden_items.reduce((suma, item) => suma + item.cantidad, 0);
              return (
                <li key={orden.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div>
                    <p className="font-semibold">Pedido #{orden.id}</p>
                    <p className="text-sm text-marron">
                      {new Date(orden.created_at).toLocaleDateString("es-AR", {
                        dateStyle: "long",
                        timeZone: "America/Argentina/Buenos_Aires",
                      })}
                      , {unidades} {unidades === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{formatearPrecio(orden.total)}</p>
                    <p className={`text-sm ${orden.estado === "rechazada" ? "text-cereza" : "text-marron"}`}>
                      {ESTADOS[orden.estado]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-6 rounded-3xl bg-kraft/45 p-8">
            <p>Todavía no hiciste pedidos. Cuando compres, acá vas a ver el estado de cada uno.</p>
            <Link href="/productos" className="boton mt-6 inline-flex">
              Ver los cafés
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
