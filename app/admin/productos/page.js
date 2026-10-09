import Link from "next/link";
import ImagenProducto from "../../components/ImagenProducto";
import EditorStock from "./EditorStock";
import InterruptorActivo from "./InterruptorActivo";
import { adminDePagina } from "@/lib/admin";
import { formatearPrecio } from "@/lib/tienda";

export const metadata = {
  title: "Productos",
};

const SECCIONES = [
  { categoria: "cafe", titulo: "Cafés", ruta: "cafes" },
  { categoria: "accesorio", titulo: "Accesorios", ruta: "accesorios" },
];

// ?guardado=Nombre o ?borrado=Nombre: aviso de lo que se acaba de hacer en el formulario
export default async function AdminProductosPage({ searchParams }) {
  const supabase = await adminDePagina();
  const { guardado, borrado } = await searchParams;

  const { data: productos } = await supabase
    .from("productos")
    .select("id, categoria, nombre, slug, activo, imagen_url, perfil, origen, variantes(id, nombre, peso_gramos, precio, stock)")
    .order("id")
    .order("peso_gramos", { referencedTable: "variantes", nullsFirst: false });

  const aviso = guardado ? `Se guardó "${guardado}".` : borrado ? `Se borró "${borrado}".` : "";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Productos</h1>
        <Link href="/admin/productos/nuevo" className="boton">
          Cargar un producto
        </Link>
      </div>

      {aviso && (
        <p role="status" className="mt-8 rounded-2xl bg-tostado px-5 py-4 text-crema">
          {aviso} Los cambios ya se ven en la tienda.
        </p>
      )}

      {SECCIONES.map(({ categoria, titulo, ruta }) => (
        <section key={categoria} aria-labelledby={`titulo-${categoria}`} className="mt-12">
          <h2 id={`titulo-${categoria}`} className="font-display text-3xl">
            {titulo}
          </h2>
          <ul className="mt-6 space-y-4">
            {productos
              .filter((producto) => producto.categoria === categoria)
              .map((producto) => (
                <li
                  key={producto.id}
                  id={`producto-${producto.id}`}
                  className={`scroll-mt-24 grid gap-5 rounded-3xl p-5 sm:grid-cols-[4.5rem_1fr] lg:grid-cols-[4.5rem_1.2fr_1.6fr_auto] lg:items-center ${
                    producto.activo ? "bg-kraft/45" : "bg-kraft/20 ring-1 ring-marron/20"
                  }`}
                >
                  <div className="w-18 overflow-hidden rounded-xl">
                    <ImagenProducto producto={producto} sizes="72px" miniatura />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-xl">{producto.nombre}</p>
                    <p className="mt-1 text-sm text-marron">
                      {producto.variantes.map((variante) => `${variante.nombre}: ${formatearPrecio(variante.precio)}`).join(", ")}
                    </p>
                    <div className="mt-3">
                      <InterruptorActivo producto={producto} />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-start-2 lg:col-start-auto">
                    <p className="text-sm font-semibold">Stock</p>
                    {producto.variantes.map((variante) => (
                      <EditorStock key={variante.id} variante={variante} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 sm:col-start-2 lg:col-start-auto lg:flex-col lg:items-end">
                    <Link href={`/admin/productos/${producto.id}`} className="boton-secundario py-2">
                      Editar
                    </Link>
                    {producto.activo && (
                      <Link href={`/${ruta}/${producto.slug}`} className="px-2 py-2 text-sm underline">
                        Ver en la tienda
                      </Link>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
