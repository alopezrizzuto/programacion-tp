import FormularioProducto from "../FormularioProducto";
import { adminDePagina } from "@/lib/admin";

export const metadata = {
  title: "Nuevo producto",
};

export default async function NuevoProductoPage() {
  await adminDePagina();

  return (
    <div>
      <h1 className="font-display text-5xl">Nuevo producto</h1>
      <p className="mt-3 text-marron">Aparece en la tienda apenas lo creás (si está marcado como visible).</p>
      <div className="mt-10">
        <FormularioProducto />
      </div>
    </div>
  );
}
