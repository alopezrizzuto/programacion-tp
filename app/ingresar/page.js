import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioIngreso from "./FormularioIngreso";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { destinoSeguro } from "@/lib/auth";

export const metadata = {
  title: "Ingresar",
};

// ?siguiente=/cuenta indica a dónde volver después de ingresar
export default async function IngresarPage({ searchParams }) {
  const destino = destinoSeguro((await searchParams).siguiente);

  // Si ya hay sesión, no tiene sentido mostrar el formulario
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(destino);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-5xl">Ingresar</h1>
      <p className="mt-3 text-marron">Entrá para seguir tus pedidos y comprar más rápido.</p>

      <FormularioIngreso destino={destino} />

      <p className="mt-10 text-center text-marron">
        ¿No tenés cuenta?{" "}
        <Link href={`/registro?siguiente=${encodeURIComponent(destino)}`} className="font-semibold text-tostado underline">
          Creá una
        </Link>
      </p>
    </div>
  );
}
