"use client";

import { useSyncExternalStore } from "react";
import { calcularEntrega, formatearDia } from "@/lib/entrega";

// La fecha depende del momento en que la persona mira la página, así que se
// calcula en el navegador. En el servidor (al compilar) no hay "ahora" útil:
// por eso useSyncExternalStore devuelve null ahí y el texto aparece al cargar.
function suscribir(avisar) {
  const intervalo = setInterval(avisar, 60000); // se recalcula cada minuto
  return () => clearInterval(intervalo);
}
const minutoActual = () => Math.floor(Date.now() / 60000);
const enServidor = () => null;

export default function FechaEntrega({ className = "" }) {
  const minuto = useSyncExternalStore(suscribir, minutoActual, enServidor);
  if (minuto === null) return <div className={`min-h-12 ${className}`} />;

  const entrega = calcularEntrega(new Date(minuto * 60000));
  const horas = Math.floor(entrega.minutosParaCorte / 60);
  const minutos = entrega.minutosParaCorte % 60;

  return (
    <div className={`flex gap-3 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mt-0.5 h-6 w-6 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
      <p className="text-[15px] leading-snug">
        Llega entre el <strong className="font-semibold">{formatearDia(entrega.desde)}</strong> y el{" "}
        <strong className="font-semibold">{formatearDia(entrega.hasta)}</strong>.
        <span className="block text-marron">
          {entrega.despachaHoy
            ? `Comprá en las próximas ${horas > 0 ? `${horas} h ` : ""}${minutos} min y lo despachamos hoy.`
            : `Lo despachamos el ${formatearDia(entrega.despacho)}.`}
        </span>
      </p>
    </div>
  );
}
