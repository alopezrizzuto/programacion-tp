import Link from "next/link";
import Campo from "../components/Campo";

export const metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-5xl font-semibold">Crear cuenta</h1>
      <ul className="mt-4 space-y-1 text-cafe">
        <li>· Seguí el estado de tus pedidos</li>
        <li>· Repetí tus compras en un clic</li>
      </ul>

      <form className="mt-10 space-y-6">
        <Campo id="nombre" etiqueta="Nombre" autoComplete="name" />
        <Campo id="email" etiqueta="Email" type="email" autoComplete="email" />
        <Campo id="password" etiqueta="Contraseña" type="password" autoComplete="new-password" />
        <Campo id="confirmacion" etiqueta="Repetí la contraseña" type="password" autoComplete="new-password" />
        <div>
          {/* El envío del formulario (validación + fetch) se implementa en E3 */}
          <button
            type="submit"
            disabled
            className="w-full bg-espresso px-6 py-4 text-crema disabled:cursor-not-allowed disabled:opacity-60"
          >
            Crear cuenta
          </button>
          <p className="mt-2 text-center text-xs text-cafe">El registro se habilita en la próxima etapa del proyecto.</p>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-cafe">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-espresso underline">Ingresá</Link>
      </p>
    </div>
  );
}
