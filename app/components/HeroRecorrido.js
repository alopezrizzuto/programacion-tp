"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Hero de la portada: lo primero que se ve. Un video del grano a la taza que ocupa toda la pantalla
// y avanza con el scroll (como en las páginas de referencia): no se reproduce solo, cada vez que bajás
// pasa un poco más y si subís retrocede. La sección mide 4 pantallas de alto; adentro, una "ventana"
// fija (sticky) muestra el video de fondo y los textos encima.
// "progreso" va de 0 (recién llegás) a 1 (terminaste de recorrerla): mueve el video y decide qué texto se ve.

const PASOS = [
  {
    titulo: "Elegimos el grano",
    texto: "Seis orígenes de altura, comprados por lote y tostados cada semana en Buenos Aires.",
  },
  {
    titulo: "Lo molemos para tu método",
    texto: "Grano entero o la molienda justa para espresso, moka, filtro o prensa francesa.",
  },
  {
    titulo: "Llega listo para tu taza",
    texto: "Con menos de 7 días de tostado: aroma, dulzor y crema como recién hecho.",
  },
];

// El video (public/video/proceso.mp4) tiene cuatro tomas: granos al molinillo, molienda del molinillo al
// portafiltro, portafiltro a la cafetera y espresso de la cafetera al vaso. Cada paso del texto empieza en un segundo del video.
const DURACION_VIDEO = 11.79;
const INICIO_PASOS = [0, 3.5, 6.75]; // segundos: granos, molienda, cafetera y taza

// Tramo del scroll en el que avanza el video: antes se ve la presentación y después el cierre
const INICIO = 0.06;
const FIN = 0.92;

const limitar = (valor, min = 0, max = 1) => Math.min(max, Math.max(min, valor));

// En qué segundo del video corresponde estar según el progreso del scroll
const segundoDelVideo = (progreso, duracion) => limitar((progreso - INICIO) / (FIN - INICIO)) * (duracion - 0.05);

export default function HeroRecorrido() {
  const seccion = useRef(null);
  const video = useRef(null);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    let cuadro = 0;
    function medir() {
      cuadro = 0;
      const caja = seccion.current.getBoundingClientRect();
      const recorrido = caja.height - window.innerHeight;
      setProgreso(limitar(-caja.top / recorrido));
    }
    // requestAnimationFrame: mide como máximo una vez por cuadro de pantalla
    function alScrollear() {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    }
    alScrollear();
    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
    };
  }, []);

  // Cada vez que cambia el progreso, el video salta al cuadro que corresponde (hacia adelante o hacia atrás).
  // Está codificado con todos los cuadros independientes, así cada salto se dibuja al instante.
  useEffect(() => {
    const elemento = video.current;
    if (elemento?.duration) elemento.currentTime = segundoDelVideo(progreso, elemento.duration);
  }, [progreso]);

  const enIntro = progreso < INICIO;
  const enFinal = progreso >= FIN;
  const segundo = segundoDelVideo(progreso, DURACION_VIDEO);
  // El paso activo es el último cuyo inicio ya pasó (y solo mientras avanza el video)
  const pasoActivo = enIntro || enFinal ? -1 : INICIO_PASOS.findLastIndex((inicio) => segundo >= inicio);

  return (
    <section ref={seccion} aria-labelledby="titulo-portada" className="relative h-[400vh] bg-tostado text-crema">
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
        {/* Video de fondo, a pantalla completa. Decorativo: los textos ya cuentan lo que pasa.
            No se reproduce solo (sin autoPlay): lo mueve el scroll. El poster es el primer cuadro. */}
        <video
          ref={video}
          src="/video/proceso.mp4"
          poster="/video/proceso-inicio.webp"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          // Apenas se conoce la duración, se ubica en el cuadro del scroll actual
          onLoadedMetadata={(evento) => {
            evento.currentTarget.currentTime = segundoDelVideo(progreso, evento.currentTarget.duration);
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Sombra para que los textos se lean sobre el video: abajo en el celular, a la izquierda en la compu */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-tostado from-15% via-tostado/75 to-tostado/10 lg:bg-gradient-to-r lg:from-tostado/90 lg:from-0% lg:via-tostado/40 lg:to-transparent"
        />

        {/* Textos: uno visible a la vez, según el paso */}
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-14 sm:px-6 lg:items-center lg:pb-0">
          <div className="grid w-full max-w-xl [grid-template-areas:'capa']">
            {/* Presentación: qué vende Origen y cómo comprar, sin tener que recorrer el video */}
            <Panel visible={enIntro}>
              <p className="text-kraft">Tostado cada semana en Buenos Aires</p>
              <h1 id="titulo-portada" className="mt-3 font-display text-[2.75rem] leading-[0.92] sm:text-7xl">
                Café de especialidad, del grano a tu taza
              </h1>
              <p className="mt-5 max-w-md text-lg text-kraft">
                Seis orígenes de altura, en grano o molidos para tu cafetera. Bajá y mirá cómo llega a tu casa.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/productos" tabIndex={enIntro ? 0 : -1} className="boton bg-crema text-tostado hover:bg-kraft">
                  Comprar café
                </Link>
                <a href="#elegi" tabIndex={enIntro ? 0 : -1} className="boton-secundario text-crema">
                  Elegí tu café ideal
                </a>
              </div>
            </Panel>

            <ol className="contents">
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} className="[grid-area:capa]">
                  <Panel visible={pasoActivo === i}>
                    <p className="text-kraft">Paso {i + 1} de {PASOS.length}</p>
                    <h2 className="mt-2 font-display text-4xl leading-none sm:text-6xl">{paso.titulo}</h2>
                    <p className="mt-5 max-w-md text-lg text-kraft">{paso.texto}</p>
                  </Panel>
                </li>
              ))}
            </ol>

            <Panel visible={enFinal}>
              <h2 className="font-display text-4xl leading-none sm:text-6xl">Ahora, encontrá el tuyo</h2>
              <p className="mt-5 max-w-md text-lg text-kraft">
                Elegí dos o tres cosas que te gustan y te recomendamos el café justo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#cafes" tabIndex={enFinal ? 0 : -1} className="boton bg-crema text-tostado hover:bg-kraft">
                  Ver los cafés
                </a>
                <a href="#elegi" tabIndex={enFinal ? 0 : -1} className="boton-secundario text-crema">
                  Hacer el test
                </a>
              </div>
            </Panel>
          </div>
        </div>

        {/* Para no obligar a nadie a recorrer el video entero */}
        <a href="#cafes" className="absolute right-4 top-4 z-20 rounded-full bg-tostado/70 px-3 py-1 text-sm text-kraft underline underline-offset-4 hover:text-crema sm:right-6">
          Saltear el recorrido
        </a>

        {/* Barra de avance del recorrido */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div className="h-full origin-left bg-kraft" style={{ transform: `scaleX(${progreso})` }} />
        </div>
      </div>
    </section>
  );
}

// Con "reducir movimiento" el cambio de texto es instantáneo (regla general en globals.css)
function Panel({ visible, children }) {
  return (
    <div
      className={`[grid-area:capa] transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
