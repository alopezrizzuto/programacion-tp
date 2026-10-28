"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Hero de la portada: lo primero que se ve. Un video grande del grano a la taza que avanza con el scroll
// (como en las páginas de referencia): no se reproduce solo, cada vez que bajás pasa un poco más
// y si subís retrocede. La sección mide 7 pantallas de alto (así el recorrido no pasa demasiado rápido);
// adentro, una "ventana" fija (sticky) muestra el video y los textos encima.
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
const INICIO = 0.05;
const FIN = 0.93;

// Suavizado: en cada cuadro de pantalla el video recorre esta fracción de lo que le falta para llegar
// al segundo que marca el scroll. Más chico = más suave (y más lento para alcanzarlo).
const SUAVIZADO = 0.1;
// Tope: como mucho avanza 0,1 s de video por cuadro de pantalla (unas 6 veces la velocidad real),
// así un scroll de golpe no saltea la historia
const PASO_MAXIMO = 0.1;

const limitar = (valor, min = 0, max = 1) => Math.min(max, Math.max(min, valor));

// En qué segundo del video corresponde estar según el progreso del scroll
const segundoDelVideo = (progreso, duracion) => limitar((progreso - INICIO) / (FIN - INICIO)) * (duracion - 0.05);

export default function HeroRecorrido() {
  const seccion = useRef(null);
  const video = useRef(null);
  // El progreso se guarda en un estado (para los textos) y en una ref (para el bucle del video, que no re-renderiza)
  const progresoActual = useRef(0);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    let cuadro = 0;
    function medir() {
      cuadro = 0;
      const caja = seccion.current.getBoundingClientRect();
      const recorrido = caja.height - window.innerHeight;
      progresoActual.current = limitar(-caja.top / recorrido);
      setProgreso(progresoActual.current);
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

  // El video no salta directo al segundo que marca el scroll: en cada cuadro de pantalla se le acerca un poco.
  // Así, aunque el scroll sea rápido, se ven todos los cuadros intermedios y la historia se entiende.
  // Está codificado con todos los cuadros independientes, así cada salto (currentTime) se dibuja al instante.
  useEffect(() => {
    let cuadro = 0;
    let segundoActual = 0;
    function avanzar() {
      const elemento = video.current;
      if (elemento?.duration) {
        const objetivo = segundoDelVideo(progresoActual.current, elemento.duration);
        const falta = objetivo - segundoActual;
        if (Math.abs(falta) > 0.01) {
          segundoActual += limitar(falta * SUAVIZADO, -PASO_MAXIMO, PASO_MAXIMO);
          // Si el navegador todavía está dibujando el salto anterior, no le pedimos otro
          if (!elemento.seeking) elemento.currentTime = segundoActual;
        }
      }
      cuadro = requestAnimationFrame(avanzar);
    }
    cuadro = requestAnimationFrame(avanzar);
    return () => cancelAnimationFrame(cuadro);
  }, []);

  const enIntro = progreso < INICIO;
  const enFinal = progreso >= FIN;
  const segundo = segundoDelVideo(progreso, DURACION_VIDEO);
  // El paso activo es el último cuyo inicio ya pasó (y solo mientras avanza el video)
  const pasoActivo = enIntro || enFinal ? -1 : INICIO_PASOS.findLastIndex((inicio) => segundo >= inicio);

  return (
    <section ref={seccion} aria-labelledby="titulo-portada" className="relative h-[700vh] bg-tostado text-crema">
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
        {/* Video: el video es cuadrado. En la compu ocupa todo el alto, a la derecha, entero (sin recortar ni agrandar
            de más, para que no pierda calidad); en el celular, la parte de arriba de la pantalla, de lado a lado.
            La máscara funde sus bordes con el fondo. Decorativo: los textos ya cuentan lo que pasa.
            No se reproduce solo (sin autoPlay): lo mueve el scroll. El poster es el primer cuadro. */}
        <div className="absolute inset-x-0 top-0 h-[68%] lg:inset-x-auto lg:right-0 lg:aspect-square lg:h-full lg:max-w-[72%]">
          <video
            ref={video}
            src="/video/proceso.mp4"
            poster="/video/proceso-inicio.webp"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-cover [mask-image:linear-gradient(to_bottom,black_55%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,black_30%)]"
          />
        </div>
        {/* En el celular el texto queda sobre la parte de abajo del video: una sombra para que se lea */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-tostado from-25% via-tostado/60 to-transparent lg:hidden"
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
