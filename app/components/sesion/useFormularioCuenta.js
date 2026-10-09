"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSesion } from "./ProveedorSesion";
import { hayErrores, normalizar } from "@/lib/auth";

// Hook propio con la lógica que comparten los formularios de ingreso y registro:
// validar en el navegador, enviar con fetch, mostrar los errores y, si sale bien, ir a `destino`.
export function useFormularioCuenta({ url, validar, destino }) {
  const router = useRouter();
  const { refrescar } = useSesion();
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [intentado, setIntentado] = useState(false);

  function leer(formulario) {
    return normalizar(Object.fromEntries(new FormData(formulario)));
  }

  // Después del primer intento, los mensajes se actualizan mientras escribís
  function alCambiar(evento) {
    if (intentado) setErrores(validar(leer(evento.currentTarget)));
  }

  async function alEnviar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = leer(formulario);
    const nuevosErrores = validar(datos);
    setIntentado(true);
    setErrores(nuevosErrores);
    setErrorGeneral("");

    // Lleva el foco al primer campo con error, para que se lea el mensaje
    if (hayErrores(nuevosErrores)) {
      formulario.elements[Object.keys(nuevosErrores)[0]].focus();
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setErrores(resultado.errores ?? {});
        setErrorGeneral(resultado.error ?? "");
        setEnviando(false);
        return;
      }
      await refrescar();
      router.push(destino);
      router.refresh();
    } catch {
      setErrorGeneral("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
      setEnviando(false);
    }
  }

  return { errores, errorGeneral, enviando, alCambiar, alEnviar };
}
