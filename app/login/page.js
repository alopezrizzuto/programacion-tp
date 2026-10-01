import Link from "next/link";
import Campo from "../components/Campo";

export const metadata = {
  title: "Ingresar",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-5xl">Ingresar</h1>
      <p className="mt-3 text-marron">Entrá para seguir tus pedidos y comprar más rápido.</p>

      <form className="mt-10 space-y-6 rounded-3xl bg-kraft/50 p-6 sm:p-8">
        <Campo id="email" etiqueta="Email" type="email" autoComplete="email" />
        <Campo id="password" etiqueta="Contraseña" type="password" autoComplete="current-password" />
        <div>
          {/* El envío del formulario (validación + fetch) se implementa en E3 */}
          <button
            type="submit"
            disabled
            className="boton w-full"
          >
            Ingresar
          </button>
          <p className="mt-2 text-center text-sm text-marron">El ingreso se habilita en la próxima etapa del proyecto.</p>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-marron">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-tostado underline">Creá una</Link>
      </p>
    </div>
  );
}
