import { notFound } from "next/navigation";
import FormularioProducto from "../FormularioProducto";
import BotonEliminar from "./BotonEliminar";
import { adminDePagina } from "@/lib/admin";

export async function generateMetadata({ params }) {
  return { title: `Editar producto ${(await params).id}` };
}

export default async function EditarProductoPage({ params }) {
  const supabase = await adminDePagina();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const { data: producto } = await supabase
    .from("productos")
    .select("*, variantes(id, nombre, peso_gramos, precio, stock)")
    .eq("id", id)
    .order("peso_gramos", { referencedTable: "variantes", nullsFirst: false })
    .maybeSingle();
  if (!producto) notFound();

  return (
    <div>
      <h1 className="font-display text-5xl">{producto.nombre}</h1>
      <div className="mt-10">
        <FormularioProducto producto={producto} />
      </div>

      <section aria-labelledby="titulo-borrar" className="mt-16 max-w-3xl rounded-3xl p-6 ring-1 ring-cereza/50">
        <h2 id="titulo-borrar" className="font-display text-2xl">
          Borrar el producto
        </h2>
        <p className="mt-2 text-marron">
          Se borra con sus variantes y reseñas, y no se puede deshacer. Si ya tiene pedidos, no se puede borrar: desmarcá
          &quot;Visible en la tienda&quot; para ocultarlo.
        </p>
        <BotonEliminar producto={{ id: producto.id, nombre: producto.nombre }} />
      </section>
    </div>
  );
}
