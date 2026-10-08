"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ImagenProducto from "./ImagenProducto";
import { useCarrito } from "./carrito/ProveedorCarrito";
import { MOLIENDAS, nombrePeso, obtenerPerfil } from "@/lib/cafes";
import { PREGUNTAS, recomendar, validarRespuestas } from "@/lib/recomendacion";
import { formatearPrecio } from "@/lib/tienda";

// Client Component: guarda las respuestas (un objeto como { intensidad: "fuerte", ... }) y si ya confirmó.
// Los resultados no se guardan: se calculan a partir de las respuestas, así
// cambian solos si el usuario toca otra opción después de confirmar.
export default function TestCafe() {
  const [respuestas, setRespuestas] = useState({});
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState(null);
  const resultadosRef = useRef(null);

  const respondidas = PREGUNTAS.filter((pregunta) => respuestas[pregunta.id]).length;
  const resultados = confirmado && !validarRespuestas(respuestas) ? recomendar(respuestas) : null;

  function responder(preguntaId, opcionId) {
    setError(null);
    setRespuestas((actuales) => ({ ...actuales, [preguntaId]: opcionId }));
  }

  function confirmar(evento) {
    evento.preventDefault();
    const problema = validarRespuestas(respuestas);
    setError(problema);
    if (problema) return;
    setConfirmado(true);
    requestAnimationFrame(() => resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function reiniciar() {
    setRespuestas({});
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
              Cuatro preguntas rápidas, sin palabras raras. Te mostramos los cafés que mejor van con vos y cómo
              molerlos para tu cafetera.
            </p>
          </div>

          <form onSubmit={confirmar} noValidate>
            {PREGUNTAS.map((pregunta) => (
              <fieldset
                key={pregunta.id}
                className="mb-8"
                aria-describedby={pregunta.ayuda ? `ayuda-${pregunta.id}` : undefined}
              >
                <legend className="text-lg font-semibold">{pregunta.titulo}</legend>
                {pregunta.ayuda && (
                  <p id={`ayuda-${pregunta.id}`} className="mt-1 text-marron">
                    {pregunta.ayuda}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  {pregunta.opciones.map((opcion) => {
                    const marcada = respuestas[pregunta.id] === opcion.id;
                    return (
                      <label
                        key={opcion.id}
                        className={`cursor-pointer rounded-full border-[1.5px] px-5 py-2.5 font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tostado ${
                          marcada
                            ? "border-tostado bg-tostado text-crema"
                            : "border-marron/50 hover:border-tostado hover:bg-kraft/40"
                        }`}
                      >
                        {/* Radio: dentro de una misma pregunta se puede elegir una sola opción */}
                        <input
                          type="radio"
                          name={pregunta.id}
                          value={opcion.id}
                          checked={marcada}
                          onChange={() => responder(pregunta.id, opcion.id)}
                          className="sr-only"
                        />
                        {opcion.nombre}
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
              {(respondidas > 0 || confirmado) && (
                <button type="button" onClick={reiniciar} className="font-semibold underline underline-offset-4">
                  Empezar de nuevo
                </button>
              )}
              <p className="text-marron sm:ml-auto">
                {respondidas} de {PREGUNTAS.length} respondidas
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
  const { agregar } = useCarrito();
  return (
    <div className="mt-16">
      <h3 className="font-display text-3xl sm:text-4xl">Tus cafés recomendados</h3>
      <ol className="mt-8 grid gap-6 lg:grid-cols-3">
        {resultados.map(({ cafe, coincidencia, motivos, molienda }, i) => {
          // Se sugiere la bolsa más chica con stock, molida según el método elegido
          const sugerida = cafe.variantes.find((v) => v.stock > 0);
          return (
            <li
              key={cafe.id}
              className={`flex flex-col overflow-hidden rounded-3xl ${i === 0 ? "bg-tostado text-crema" : "bg-kraft/45"}`}
            >
              <div className="p-3 pb-0">
                <div className="overflow-hidden rounded-2xl">
                  <ImagenProducto producto={cafe} sizes="(min-width: 1024px) 33vw, 100vw" aspecto="aspect-[16/9]" />
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
                {motivos.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5">
                    {motivos.map((motivo) => (
                      <li key={motivo} className="first-letter:uppercase">
                        {motivo}.
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4">
                  Molienda sugerida:{" "}
                  <strong className="font-semibold">{MOLIENDAS.find((m) => m.id === molienda).nombre.toLowerCase()}</strong>
                </p>
                <div className="mt-auto pt-6">
                  <p>
                    Bolsa de {nombrePeso(sugerida.peso_gramos)}:{" "}
                    <strong className="font-semibold">{formatearPrecio(sugerida.precio)}</strong>
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => agregar({ varianteId: sugerida.id, molienda })}
                      className={i === 0 ? "boton bg-crema text-tostado hover:bg-kraft" : "boton"}
                    >
                      Agregar al carrito
                    </button>
                    <Link href={`/cafes/${cafe.slug}`} className="font-semibold underline underline-offset-4">
                      Ver este café
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
