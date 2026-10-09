import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioRegistro from "./FormularioRegistro";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { destinoSeguro } from "@/lib/auth";

export const metadata = {
  title: "Crear cuenta",
};

export default async function RegistroPage({ searchParams }) {
  const destino = destinoSeguro((await searchParams).siguiente);

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(destino);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-5xl">Crear cuenta</h1>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-marron">
        <li>Seguí el estado de tus pedidos.</li>
        <li>Repetí tus compras en un clic.</li>
      </ul>

      <FormularioRegistro destino={destino} />

      <p className="mt-10 text-center text-marron">
        ¿Ya tenés cuenta?{" "}
        <Link href={`/ingresar?siguiente=${encodeURIComponent(destino)}`} className="font-semibold text-tostado underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
