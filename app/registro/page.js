import Link from "next/link";
import Campo from "../components/Campo";

export const metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-5xl">Crear cuenta</h1>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-marron">
        <li>Seguí el estado de tus pedidos.</li>
        <li>Repetí tus compras en un clic.</li>
      </ul>

      <form className="mt-10 space-y-6 rounded-3xl bg-kraft/50 p-6 sm:p-8">
        <Campo id="nombre" etiqueta="Nombre" autoComplete="name" />
        <Campo id="email" etiqueta="Email" type="email" autoComplete="email" />
        <Campo id="password" etiqueta="Contraseña" type="password" autoComplete="new-password" />
        <Campo id="confirmacion" etiqueta="Repetí la contraseña" type="password" autoComplete="new-password" />
        <div>
          {/* El envío del formulario (validación + fetch) se implementa en E3 */}
          <button
            type="submit"
            disabled
            className="boton w-full"
          >
            Crear cuenta
          </button>
          <p className="mt-2 text-center text-sm text-marron">El registro se habilita en la próxima etapa del proyecto.</p>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-marron">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-tostado underline">Ingresá</Link>
      </p>
    </div>
  );
}
