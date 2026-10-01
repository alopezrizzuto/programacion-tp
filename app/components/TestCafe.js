"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ImagenCafe from "./ImagenCafe";
import { MOLIENDAS, obtenerPerfil, precioDesde } from "@/lib/cafes";
import { MAX_PREFERENCIAS, PREFERENCIAS, recomendar, validarPreferencias } from "@/lib/recomendacion";
import { formatearPrecio } from "@/lib/tienda";

const GRUPOS = [
  { id: "sabor", titulo: "¿Qué sabores te gustan?" },
  { id: "preparacion", titulo: "¿Cómo lo tomás?" },
];

// Client Component: guarda qué opciones marcó el usuario y si ya confirmó.
// Los resultados no se guardan: se calculan a partir de la selección, así
// cambian solos si el usuario toca otra opción después de confirmar.
export default function TestCafe() {
  const [seleccion, setSeleccion] = useState([]);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState(null);
  const resultadosRef = useRef(null);

  const lleno = seleccion.length >= MAX_PREFERENCIAS;
  const resultados = confirmado && !validarPreferencias(seleccion) ? recomendar(seleccion) : null;

  function alternar(id) {
    setError(null);
    setSeleccion((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]));
  }

  function confirmar(evento) {
    evento.preventDefault();
    const problema = validarPreferencias(seleccion);
    setError(problema);
    if (problema) return;
    setConfirmado(true);
    requestAnimationFrame(() => resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function reiniciar() {
    setSeleccion([]);
    setConfirmado(false);
    setError(null);
  }

  return (
    <section id="elegi" aria-labelledby="titulo-test" className="scroll-mt-16 bg-crema">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 id="titulo-test" className="font-display text-5xl leading-[0.95] sm:text-6xl">
              Elegí tu café ideal
            </h2>
            <p className="mt-6 max-w-md text-lg text-marron">
              Marcá dos o tres cosas que te gustan. Te mostramos los cafés que mejor van con vos y cómo molerlos.
            </p>
          </div>

          <form onSubmit={confirmar} noValidate>
            {GRUPOS.map((grupo) => (
              <fieldset key={grupo.id} className="mb-8">
                <legend className="mb-4 text-lg font-semibold">{grupo.titulo}</legend>
                <div className="flex flex-wrap gap-3">
                  {PREFERENCIAS.filter((p) => p.grupo === grupo.id).map((preferencia) => {
                    const marcada = seleccion.includes(preferencia.id);
                    const bloqueada = lleno && !marcada;
                    return (
                      <label
                        key={preferencia.id}
                        className={`cursor-pointer rounded-full border-[1.5px] px-5 py-2.5 font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tostado ${
                          marcada
                            ? "border-tostado bg-tostado text-crema"
                            : bloqueada
                              ? "cursor-not-allowed border-marron/30 text-marron/60"
                              : "border-marron/50 hover:border-tostado hover:bg-kraft/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="preferencias"
                          value={preferencia.id}
                          checked={marcada}
                          disabled={bloqueada}
                          onChange={() => alternar(preferencia.id)}
                          className="sr-only"
                        />
                        {preferencia.nombre}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="flex flex-wrap items-center gap-4 border-t border-marron/20 pt-6">
              <button type="submit" className="boton">
                Ver mi café
              </button>
              {(seleccion.length > 0 || confirmado) && (
                <button type="button" onClick={reiniciar} className="font-semibold underline underline-offset-4">
                  Empezar de nuevo
                </button>
              )}
              <p className="text-marron sm:ml-auto" aria-live="polite">
                {seleccion.length} de {MAX_PREFERENCIAS} elegidas
              </p>
            </div>
            <p role="alert" className="mt-3 min-h-6 font-medium text-cereza">
              {error}
            </p>
          </form>
        </div>

        {/* aria-live: el lector de pantalla anuncia cuando aparecen o cambian los resultados */}
        <div ref={resultadosRef} aria-live="polite" className="scroll-mt-24">
          {resultados && <Resultados resultados={resultados} />}
        </div>
      </div>
    </section>
  );
}

function Resultados({ resultados }) {
  if (resultados.length === 0) {
    return <p className="mt-12 text-lg">No encontramos un café para esa combinación. Probá con otras opciones.</p>;
  }

  return (
    <div className="mt-16">
      <h3 className="font-display text-3xl sm:text-4xl">Tus cafés recomendados</h3>
      <ol className="mt-8 grid gap-6 lg:grid-cols-3">
        {resultados.map(({ cafe, coincidencia, motivos, molienda }, i) => (
          <li
            key={cafe.id}
            className={`flex flex-col overflow-hidden rounded-3xl ${
              i === 0 ? "bg-tostado text-crema" : "bg-kraft/45"
            }`}
          >
            <div className="p-3 pb-0">
              <div className="overflow-hidden rounded-2xl">
                <ImagenCafe cafe={cafe} sizes="(min-width: 1024px) 33vw, 100vw" aspecto="aspect-[16/9]" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className={i === 0 ? "text-kraft" : "text-marron"}>
                {i === 0 ? "Tu mejor opción" : `Opción ${i + 1}`}: {coincidencia}% de coincidencia
              </p>
              <h4 className="mt-1 font-display text-3xl">{cafe.nombre}</h4>
              <p className={`mt-1 ${i === 0 ? "text-kraft" : "text-marron"}`}>
                {obtenerPerfil(cafe.perfil).nombre}, de {cafe.origen}
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5">
                {motivos.map((motivo) => (
                  <li key={motivo} className="first-letter:uppercase">{motivo}.</li>
                ))}
              </ul>
              <p className="mt-4">
                Molienda sugerida:{" "}
                <strong className="font-semibold">
                  {MOLIENDAS.find((m) => m.id === molienda).nombre.toLowerCase()}
                </strong>
              </p>
              <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                <p>
                  Desde <strong className="font-semibold">{formatearPrecio(precioDesde(cafe))}</strong>
                </p>
                <Link
                  href={`/cafes/${cafe.slug}`}
                  className={i === 0 ? "boton bg-crema text-tostado hover:bg-kraft" : "boton"}
                >
                  Ver este café
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
