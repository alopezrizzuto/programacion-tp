"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Copia el link del seguimiento (sin los avisos de la URL) para guardarlo o compartirlo
export function BotonCopiarLink() {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = new URL(window.location.href);
    url.search = "";
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiado(true);
    } catch {
      window.prompt("Copiá el link de tu pedido:", url.toString());
    }
  }

  return (
    <button type="button" onClick={copiar} className="boton-secundario py-2">
      <span aria-live="polite">{copiado ? "Link copiado" : "Copiar el link"}</span>
    </button>
  );
}

// Mientras Mercado Pago confirma el pago (el aviso al webhook tarda unos segundos),
// vuelve a pedir la página cada 3 segundos, hasta 10 veces.
export function ActualizarSolo() {
  const router = useRouter();
  useEffect(() => {
    let veces = 0;
    const intervalo = setInterval(() => {
      veces += 1;
      router.refresh();
      if (veces >= 10) clearInterval(intervalo);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [router]);
  return null;
}
