"use client";

import Campo from "../components/Campo";
import { useFormularioCuenta } from "../components/sesion/useFormularioCuenta";
import { LARGO_MINIMO_CONTRASENA, validarRegistro } from "@/lib/auth";

export default function FormularioRegistro({ destino }) {
  const { errores, errorGeneral, enviando, alCambiar, alEnviar } = useFormularioCuenta({
    url: "/api/auth/registro",
    validar: validarRegistro,
    destino,
  });

  return (
    <form noValidate onSubmit={alEnviar} onChange={alCambiar} className="mt-10 space-y-6 rounded-3xl bg-kraft/50 p-6 sm:p-8">
      <Campo id="nombre" etiqueta="Nombre" autoComplete="name" required error={errores.nombre} />
      <Campo id="email" etiqueta="Email" type="email" autoComplete="email" required error={errores.email} />
      <Campo
        id="password"
        etiqueta="Contraseña"
        type="password"
        autoComplete="new-password"
        required
        ayuda={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres, con al menos una letra y un número.`}
        error={errores.password}
      />
      <Campo
        id="confirmacion"
        etiqueta="Repetí la contraseña"
        type="password"
        autoComplete="new-password"
        required
        error={errores.confirmacion}
      />
      <div>
        {errorGeneral && (
          <p role="alert" className="mb-4 rounded-xl bg-cereza px-4 py-3 text-crema">
            {errorGeneral}
          </p>
        )}
        <button type="submit" disabled={enviando} className="boton w-full">
          {enviando ? "Creando tu cuenta…" : "Crear cuenta"}
        </button>
      </div>
    </form>
  );
}
