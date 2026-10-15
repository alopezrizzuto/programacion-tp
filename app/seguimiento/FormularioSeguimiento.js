"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Campo from "../components/Campo";
import { FORMATO_CODIGO } from "@/lib/ordenes";

// Acepta el código con o sin "OC-", en minúsculas o con espacios: lo deja en el formato correcto
function normalizarCodigo(texto) {
  const limpio = texto.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^OC/, "");
  return `OC-${limpio}`;
}

export default function FormularioSeguimiento() {
  const router = useRouter();
  const [error, setError] = useState("");

  function alEnviar(evento) {
    evento.preventDefault();
    const codigo = normalizarCodigo(new FormData(evento.currentTarget).get("codigo"));
    if (!FORMATO_CODIGO.test(codigo)) {
      setError("El código tiene el formato OC- y 10 letras o números.");
      evento.currentTarget.elements.namedItem("codigo").focus();
      return;
    }
    router.push(`/seguimiento/${codigo}`);
  }

  return (
    <form noValidate onSubmit={alEnviar} className="mt-10 space-y-6 rounded-3xl bg-kraft/50 p-6 sm:p-8">
      <Campo id="codigo" etiqueta="Código de seguimiento" autoComplete="off" spellCheck={false} error={error} required />
      <button type="submit" className="boton w-full">
        Ver mi pedido
      </button>
    </form>
  );
}
