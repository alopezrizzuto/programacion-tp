import Link from "next/link";
import Campo from "../components/Campo";

export const metadata = {
  title: "Ingresar",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-5xl font-semibold">Ingresar</h1>
      <p className="mt-3 text-cafe">Entrá para seguir tus pedidos y comprar más rápido.</p>

      <form className="mt-10 space-y-6">
        <Campo id="email" etiqueta="Email" type="email" autoComplete="email" />
        <Campo id="password" etiqueta="Contraseña" type="password" autoComplete="current-password" />
        <div>
          {/* El envío del formulario (validación + fetch) se implementa en E3 */}
          <button
            type="submit"
            disabled
            className="w-full bg-espresso px-6 py-4 text-crema disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ingresar
          </button>
          <p className="mt-2 text-center text-xs text-cafe">El ingreso se habilita en la próxima etapa del proyecto.</p>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-cafe">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-espresso underline">Creá una</Link>
      </p>
    </div>
  );
}
