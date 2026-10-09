"use client";

import Campo from "../components/Campo";
import { useFormularioCuenta } from "../components/sesion/useFormularioCuenta";
import { validarIngreso } from "@/lib/auth";

export default function FormularioIngreso({ destino }) {
  const { errores, errorGeneral, enviando, alCambiar, alEnviar } = useFormularioCuenta({
    url: "/api/auth/ingresar",
    validar: validarIngreso,
    destino,
  });

  // noValidate: se apagan los avisos del navegador para mostrar los nuestros, iguales en todos lados
  return (
    <form noValidate onSubmit={alEnviar} onChange={alCambiar} className="mt-10 space-y-6 rounded-3xl bg-kraft/50 p-6 sm:p-8">
      <Campo id="email" etiqueta="Email" type="email" autoComplete="email" required error={errores.email} />
      <Campo
        id="password"
        etiqueta="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        error={errores.password}
      />
      <div>
        {/* role="alert": el lector de pantalla anuncia el error apenas aparece */}
        {errorGeneral && (
          <p role="alert" className="mb-4 rounded-xl bg-cereza px-4 py-3 text-crema">
            {errorGeneral}
          </p>
        )}
        <button type="submit" disabled={enviando} className="boton w-full">
          {enviando ? "Ingresando…" : "Ingresar"}
        </button>
      </div>
    </form>
  );
}
