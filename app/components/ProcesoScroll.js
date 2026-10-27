"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Recorrido de la portada (va después del hero): un video del grano a la taza que avanza con el scroll.
// La sección mide 3 pantallas de alto; adentro, una "ventana" fija (sticky) muestra el video y los textos.
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

// Tramos del recorrido: [inicio, fin] de cada paso dentro del progreso total.
// El video tiene tres tomas de unos 3 segundos, así que cada texto coincide con su toma.
const TRAMOS = [
  [0.1, 0.37],
  [0.37, 0.64],
  [0.64, 0.9],
];

const limitar = (valor, min = 0, max = 1) => Math.min(max, Math.max(min, valor));

// En qué segundo del video corresponde estar según el progreso del scroll.
// Arranca un poco después de entrar (0.05) y termina un poco antes del final (0.95).
const segundoDelVideo = (progreso, duracion) => limitar((progreso - 0.05) / 0.9) * (duracion - 0.05);

// Lee la preferencia del sistema "reducir movimiento" y se entera si cambia
function suscribirMovimiento(avisar) {
  const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
  consulta.addEventListener("change", avisar);
  return () => consulta.removeEventListener("change", avisar);
}
const leerMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ProcesoScroll() {
  const seccion = useRef(null);
  const [progresoScroll, setProgresoScroll] = useState(0);
  const sinMovimiento = useSyncExternalStore(suscribirMovimiento, leerMovimiento, () => false);
  // Con "reducir movimiento" se muestra directamente la escena final, sin animar
  const progreso = sinMovimiento ? 1 : progresoScroll;

  useEffect(() => {
    let cuadro = 0;
    function medir() {
      cuadro = 0;
      const caja = seccion.current.getBoundingClientRect();
      const recorrido = caja.height - window.innerHeight;
      setProgresoScroll(limitar(-caja.top / recorrido));
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

  const pasoActivo = TRAMOS.findIndex(([inicio, fin]) => progreso >= inicio && progreso < fin);
  const enIntro = progreso < TRAMOS[0][0];
  const enFinal = progreso >= TRAMOS[2][1];

  return (
    <section
      ref={seccion}
      aria-labelledby="titulo-recorrido"
      className="relative h-[300vh] bg-tostado text-crema motion-reduce:h-auto"
    >
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div className="mx-auto grid h-full max-w-7xl grid-rows-[minmax(0,1fr)] lg:grid-cols-[1fr_1.1fr] motion-reduce:grid-rows-none">
          {/* Textos: uno visible a la vez, según el paso */}
          <div className="relative z-10 flex h-full items-end px-4 pb-10 sm:px-6 lg:items-center lg:pb-0 motion-reduce:items-start motion-reduce:py-16">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-tostado via-tostado to-transparent lg:hidden motion-reduce:hidden" />
            <div className="relative grid w-full [grid-template-areas:'capa'] motion-reduce:block motion-reduce:space-y-10">
              <Panel visible={enIntro || sinMovimiento}>
                <h2 id="titulo-recorrido" className="font-display text-5xl leading-[0.95] sm:text-6xl">
                  Del grano a tu taza
                </h2>
                <p className="mt-6 max-w-md text-lg text-kraft">
                  Así llega cada bolsa a tu casa.{!sinMovimiento && " Seguí bajando."}
                </p>
              </Panel>

              <ol className="contents motion-reduce:block motion-reduce:space-y-8">
                {PASOS.map((paso, i) => (
                  <li key={paso.titulo} className="[grid-area:capa]">
                    <Panel visible={pasoActivo === i || sinMovimiento}>
                      <p className="text-kraft">Paso {i + 1} de {PASOS.length}</p>
                      <h2 className="mt-2 font-display text-4xl leading-none sm:text-6xl">{paso.titulo}</h2>
                      <p className="mt-5 max-w-md text-lg text-kraft">{paso.texto}</p>
                    </Panel>
                  </li>
                ))}
              </ol>

              <Panel visible={enFinal || sinMovimiento}>
                <h2 className="font-display text-4xl leading-none sm:text-6xl">Ahora, encontrá el tuyo</h2>
                <p className="mt-5 max-w-md text-lg text-kraft">
                  Elegí dos o tres cosas que te gustan y te recomendamos el café justo.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#cafes" tabIndex={enFinal || sinMovimiento ? 0 : -1} className="boton bg-crema text-tostado hover:bg-kraft">
                    Ver los cafés
                  </a>
                  <a href="#elegi" tabIndex={enFinal || sinMovimiento ? 0 : -1} className="boton-secundario text-crema">
                    Hacer el test
                  </a>
                </div>
              </Panel>
            </div>
          </div>

          {/* Video: decorativo, los textos ya cuentan lo que pasa */}
          <div className="absolute inset-x-0 top-0 bottom-[38%] lg:relative lg:inset-auto lg:h-full motion-reduce:relative motion-reduce:inset-auto motion-reduce:aspect-square motion-reduce:h-auto lg:motion-reduce:h-auto lg:motion-reduce:self-center">
            <VideoProceso progreso={progreso} sinMovimiento={sinMovimiento} seccion={seccion} />
          </div>
        </div>

        {/* Para no obligar a nadie a recorrer la animación entera */}
        <a href="#cafes" className="absolute right-4 top-4 z-20 text-sm text-kraft underline underline-offset-4 hover:text-crema sm:right-6 motion-reduce:hidden">
          Saltear el recorrido
        </a>

        {/* Barra de avance del recorrido */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/10 motion-reduce:hidden">
          <div className="h-full origin-left bg-kraft" style={{ transform: `scaleX(${progreso})` }} />
        </div>
      </div>
    </section>
  );
}

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

// La máscara funde los bordes del video con el fondo oscuro de la sección
const ESTILO_VIDEO =
  "h-full w-full object-cover [mask-image:radial-gradient(ellipse_closest-side,black_72%,transparent_100%)]";

// El video no se reproduce solo: el scroll lo lleva al segundo justo (currentTime), hacia adelante o hacia atrás.
// Está codificado con todos los cuadros independientes, así cada salto se dibuja al instante.
// Para no quitarle velocidad a la portada, recién se descarga cuando la sección está a una pantalla de distancia.
function VideoProceso({ progreso, sinMovimiento, seccion }) {
  const video = useRef(null);
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setCerca(true);
          observador.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observador.observe(seccion.current);
    return () => observador.disconnect();
  }, [seccion]);

  // Cada vez que cambia el progreso, el video salta al cuadro que corresponde
  useEffect(() => {
    const elemento = video.current;
    if (elemento?.duration) elemento.currentTime = segundoDelVideo(progreso, elemento.duration);
  }, [progreso]);

  // Con "reducir movimiento" no hay video: queda la imagen del final (el espresso servido)
  if (sinMovimiento) {
    // eslint-disable-next-line @next/next/no-img-element -- es un cuadro del propio video, ya optimizado (13 KB)
    return <img src="/video/proceso-final.webp" alt="" className={ESTILO_VIDEO} />;
  }

  return (
    <video
      ref={video}
      src={cerca ? "/video/proceso.mp4" : undefined}
      poster="/video/proceso-inicio.webp"
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      // Apenas se conoce la duración, se ubica en el cuadro del scroll actual
      onLoadedMetadata={(evento) => {
        evento.currentTarget.currentTime = segundoDelVideo(progreso, evento.currentTarget.duration);
      }}
      className={ESTILO_VIDEO}
    />
  );
}
