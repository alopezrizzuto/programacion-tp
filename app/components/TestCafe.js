"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ImagenProducto from "./ImagenProducto";
import IconoOpcion from "./IconoOpcion";
import { useCarrito } from "./carrito/ProveedorCarrito";
import { MOLIENDAS, nombrePeso, obtenerPerfil } from "@/lib/productos";
import { PREGUNTAS, validarRespuestas } from "@/lib/recomendacion";
import { formatearPrecio } from "@/lib/tienda";

// Test "Elegí tu café ideal": una pregunta por vez, con el recorrido de pasos a la izquierda.
// Estado: las respuestas ({ intensidad: "fuerte", ... }), en qué paso está, si ya confirmó
// y los resultados. La recomendación la calcula el servidor (POST /api/recomendacion): acá se validan
// las respuestas antes de enviarlas (para avisar al instante qué falta) y el servidor las vuelve a validar.
// Después de confirmar, si el usuario cambia una respuesta se vuelve a consultar y los resultados se actualizan.
export default function TestCafe() {
  const [respuestas, setRespuestas] = useState({});
  const [paso, setPaso] = useState(0);
  const [confirmado, setConfirmado] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  // El pedido en curso: si llega otro (la persona cambió una respuesta), el anterior se cancela
  const pedido = useRef(null);
  const resultadosRef = useRef(null);
  const tituloRef = useRef(null);
  const avanceRef = useRef(null);
  const enfocar = useRef(false);
  // true cuando la última elección fue con mouse o dedo (pointerdown), false si fue con el teclado
  const conPuntero = useRef(false);

  const pregunta = PREGUNTAS[paso];
  const esUltima = paso === PREGUNTAS.length - 1;
  const respondidas = PREGUNTAS.filter((p) => respuestas[p.id]).length;

  // Al cambiar de paso, el foco va al título de la pregunta (para teclado y lectores de pantalla).
  // No pasa al cargar la página: solo cuando la persona avanzó o volvió.
  useEffect(() => {
    if (enfocar.current) tituloRef.current?.focus({ preventScroll: true });
    enfocar.current = false;
  }, [paso]);

  // Si el componente se desmonta con un avance o un pedido pendiente, se cancelan
  useEffect(
    () => () => {
      clearTimeout(avanceRef.current);
      pedido.current?.abort();
    },
    [],
  );

  // Pide la recomendación al servidor. Devuelve true si salió bien.
  async function consultar(respuestasAEnviar) {
    pedido.current?.abort();
    const controlador = new AbortController();
    pedido.current = controlador;
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch("/api/recomendacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestasAEnviar),
        signal: controlador.signal,
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.error ?? "No pudimos calcular tu café. Probá de nuevo.");
        setResultados(null);
        return false;
      }
      setResultados(datos.resultados);
      return true;
    } catch (problema) {
      // Cancelado porque llegó un pedido más nuevo: no es un error
      if (problema.name === "AbortError") return false;
      setError("No pudimos conectarnos. Revisá tu conexión y probá de nuevo.");
      setResultados(null);
      return false;
    } finally {
      if (pedido.current === controlador) setCargando(false);
    }
  }

  function irA(nuevoPaso) {
    clearTimeout(avanceRef.current);
    enfocar.current = true;
    setPaso(nuevoPaso);
  }

  // Con el mouse o el dedo, elegir una opción pasa sola a la siguiente pregunta (con una pausa corta
  // para que se vea la elección). Con el teclado (flechas) no: se avanza con "Siguiente".
  function elegir(opcionId) {
    setError(null);
    const nuevas = { ...respuestas, [pregunta.id]: opcionId };
    setRespuestas(nuevas);
    // Si ya vio sus resultados, se recalculan con la respuesta nueva
    if (confirmado) consultar(nuevas);
    if (conPuntero.current && !esUltima) {
      clearTimeout(avanceRef.current);
      avanceRef.current = setTimeout(() => irA(paso + 1), 280);
    }
  }

  async function confirmar(evento) {
    evento.preventDefault();
    // Validación en el navegador: avisa al instante qué falta, sin ir al servidor
    const problema = validarRespuestas(respuestas);
    setError(problema);
    if (problema) {
      // Lleva a la primera pregunta sin responder
      irA(PREGUNTAS.findIndex((p) => !respuestas[p.id]));
      return;
    }
    setConfirmado(true);
    if (await consultar(respuestas)) {
      requestAnimationFrame(() => resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  function reiniciar() {
    pedido.current?.abort();
    setRespuestas({});
    setConfirmado(false);
    setResultados(null);
    setCargando(false);
    setError(null);
    irA(0);
  }

  return (
    <section id="elegi" aria-labelledby="titulo-test" className="scroll-mt-16 bg-crema">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <form
          onSubmit={confirmar}
          noValidate
          className="grid overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(42,26,18,0.45)] lg:grid-cols-[0.8fr_1.2fr]"
        >
          {/* Izquierda: qué es el test y los pasos, con la respuesta de cada uno */}
          <div className="bg-tostado p-7 text-crema sm:p-10">
            <h2 id="titulo-test" className="font-display text-4xl leading-[0.95] sm:text-5xl">
              Elegí tu café ideal
            </h2>
            <p className="mt-4 text-kraft">
              Cuatro preguntas, sin palabras raras. Te decimos qué café va con vos y cómo molerlo para tu cafetera.
            </p>

            <ol className="mt-8 space-y-2">
              {PREGUNTAS.map((p, i) => {
                const elegida = p.opciones.find((o) => o.id === respuestas[p.id]);
                const actual = i === paso;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => irA(i)}
                      aria-current={actual ? "step" : undefined}
                      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors ${
                        actual ? "bg-crema/10" : "hover:bg-crema/5"
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                          elegida ? "bg-kraft text-tostado" : actual ? "border-[1.5px] border-crema" : "border-[1.5px] border-kraft/40 text-kraft"
                        }`}
                      >
                        {elegida ? (
                          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className={`block font-semibold ${actual ? "text-crema" : "text-kraft"}`}>{p.corto}</span>
                        <span className="block truncate text-sm text-kraft/80">{elegida ? elegida.nombre : "Sin responder"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {(respondidas > 0 || confirmado) && (
              <button type="button" onClick={reiniciar} className="mt-6 px-4 text-sm font-semibold text-kraft underline underline-offset-4 hover:text-crema">
                Empezar de nuevo
              </button>
            )}
          </div>

          {/* Derecha: la pregunta actual */}
          <div className="flex flex-col bg-kraft/40 p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4 text-sm text-marron">
              <span>
                Pregunta {paso + 1} de {PREGUNTAS.length}
              </span>
              <span>
                {respondidas} de {PREGUNTAS.length} respondidas
              </span>
            </div>
            <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-marron/15">
              <div className="h-full rounded-full bg-tostado transition-[width] duration-300" style={{ width: `${(respondidas / PREGUNTAS.length) * 100}%` }} />
            </div>

            {/* key: al cambiar de pregunta se arma de nuevo, y entra con una transición corta */}
            <fieldset key={pregunta.id} className="mt-8 animate-[entrar-pregunta_0.35s_ease-out_both]" aria-describedby={pregunta.ayuda ? `ayuda-${pregunta.id}` : undefined}>
              <legend className="sr-only">{pregunta.titulo}</legend>
              <h3 ref={tituloRef} tabIndex={-1} className="font-display text-3xl leading-tight outline-none sm:text-4xl">
                {pregunta.titulo}
              </h3>
              {pregunta.ayuda && (
                <p id={`ayuda-${pregunta.id}`} className="mt-2 text-marron">
                  {pregunta.ayuda}
                </p>
              )}

              <div className={`mt-6 grid gap-3 ${pregunta.opciones.length > 3 ? "grid-cols-2 sm:grid-cols-3" : pregunta.opciones.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {pregunta.opciones.map((opcion) => {
                  const marcada = respuestas[pregunta.id] === opcion.id;
                  return (
                    <label
                      key={opcion.id}
                      onPointerDown={() => (conPuntero.current = true)}
                      className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] px-3 py-5 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tostado ${
                        marcada
                          ? "border-tostado bg-tostado text-crema [--fondo-icono:#2a1a12]"
                          : "border-marron/25 bg-crema hover:border-tostado [--fondo-icono:#f3ebdd]"
                      }`}
                    >
                      {/* Radio: dentro de una misma pregunta se puede elegir una sola opción */}
                      <input
                        type="radio"
                        name={pregunta.id}
                        value={opcion.id}
                        checked={marcada}
                        onChange={() => elegir(opcion.id)}
                        onKeyDown={() => (conPuntero.current = false)}
                        className="sr-only"
                      />
                      <IconoOpcion opcion={opcion.id} className="h-11 w-11 sm:h-14 sm:w-14" />
                      <span className="font-semibold leading-tight">{opcion.nombre}</span>
                      <span className={`text-sm leading-snug ${marcada ? "text-kraft" : "text-marron"}`}>{opcion.detalle}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <p role="alert" className="mt-4 min-h-6 font-medium text-cereza">
              {error}
            </p>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
              <button type="button" onClick={() => irA(paso - 1)} disabled={paso === 0} className="boton-secundario py-2.5 disabled:invisible">
                Anterior
              </button>
              {esUltima ? (
                <button type="submit" disabled={cargando} className="boton disabled:opacity-70">
                  {cargando ? "Buscando tu café…" : confirmado ? "Actualizar mi café" : "Ver mi café"}
                </button>
              ) : (
                <button type="button" onClick={() => irA(paso + 1)} disabled={!respuestas[pregunta.id]} className="boton">
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </form>

        {/* aria-live: el lector de pantalla anuncia cuando aparecen o cambian los resultados */}
        {/* aria-busy: mientras llega la respuesta del servidor, el lector de pantalla espera para anunciar */}
        <div ref={resultadosRef} aria-live="polite" aria-busy={cargando} className={`scroll-mt-24 transition-opacity ${cargando ? "opacity-60" : ""}`}>
          {resultados &&
            (resultados.length > 0 ? (
              <Resultados resultados={resultados} />
            ) : (
              <p className="mt-14 text-lg">
                Ahora no tenemos cafés con stock. Volvé en unos días o{" "}
                <Link href="/contacto" className="font-semibold underline underline-offset-4">escribinos</Link>.
              </p>
            ))}
        </div>
      </div>
    </section>
  );
}

function Resultados({ resultados }) {
  const { agregar } = useCarrito();
  const [principal, ...otros] = resultados;

  return (
    <div className="mt-14">
      <h3 className="font-display text-3xl sm:text-4xl">Tu café ideal</h3>
      <Recomendado resultado={principal} agregar={agregar} destacado />
      {otros.length > 0 && (
        <>
          <h4 className="mt-12 text-lg font-semibold">También te pueden gustar</h4>
          <ol className="mt-4 grid gap-5 md:grid-cols-2">
            {otros.map((resultado) => (
              <li key={resultado.cafe.id}>
                <Recomendado resultado={resultado} agregar={agregar} />
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

// Un café recomendado. "destacado": el primero, grande y con la foto protagonista.
function Recomendado({ resultado, agregar, destacado = false }) {
  const { cafe, coincidencia, motivos, molienda } = resultado;
  // Se sugiere la bolsa más chica con stock, molida según el método elegido
  const sugerida = cafe.variantes.find((v) => v.stock > 0);
  const nombreMolienda = MOLIENDAS.find((m) => m.id === molienda).nombre.toLowerCase();

  return (
    <article
      className={`grid overflow-hidden rounded-3xl bg-kraft/40 ${
        destacado ? "mt-6 md:grid-cols-[0.9fr_1.1fr]" : "h-full grid-cols-[7rem_1fr] sm:grid-cols-[9rem_1fr]"
      }`}
    >
      <ImagenProducto producto={cafe} sizes={destacado ? "(min-width: 768px) 40vw, 100vw" : "144px"} aspecto={destacado ? "aspect-square" : "aspect-auto h-full min-h-full"} />
      <div className={`flex flex-col ${destacado ? "p-7 sm:p-10" : "p-5"}`}>
        <p className={`self-start rounded-full bg-tostado px-3 py-1 font-semibold text-crema ${destacado ? "" : "text-sm"}`}>
          {coincidencia}% de coincidencia
        </p>
        <h4 className={`mt-4 font-display leading-none ${destacado ? "text-4xl sm:text-5xl" : "text-2xl"}`}>{cafe.nombre}</h4>
        <p className="mt-2 text-marron">
          {obtenerPerfil(cafe.perfil).nombre}, de {cafe.origen}
        </p>

        {destacado && motivos.length > 0 && (
          <ul className="mt-6 space-y-2">
            {motivos.map((motivo) => (
              <li key={motivo} className="flex gap-3">
                <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="first-letter:uppercase">{motivo}.</span>
              </li>
            ))}
          </ul>
        )}

        <p className={destacado ? "mt-6" : "mt-3 text-sm"}>
          Molienda sugerida: <strong className="font-semibold">{nombreMolienda}</strong>
        </p>

        <div className={`mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 ${destacado ? "pt-8" : "pt-4"}`}>
          {destacado && (
            <p className="w-full">
              Bolsa de {nombrePeso(sugerida.peso_gramos)}:{" "}
              <strong className="text-xl font-semibold tabular-nums">{formatearPrecio(sugerida.precio)}</strong>
            </p>
          )}
          <button
            type="button"
            onClick={() => agregar({ varianteId: sugerida.id, molienda })}
            className={destacado ? "boton" : "boton py-2 text-sm"}
          >
            Agregar al carrito
          </button>
          <Link href={`/cafes/${cafe.slug}`} className={`font-semibold underline underline-offset-4 ${destacado ? "" : "text-sm"}`}>
            Ver este café
          </Link>
        </div>
      </div>
    </article>
  );
}
