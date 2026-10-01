"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

// Animación de la portada: al scrollear, el café recorre grano → molinillo → portafiltro → vaso.
// La sección mide 4 pantallas de alto; adentro, una "ventana" fija (sticky) muestra el dibujo.
// "progreso" va de 0 (recién llegás) a 1 (terminaste de recorrerla) y mueve todo el dibujo.

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

// Tramos del recorrido: [inicio, fin] de cada paso dentro del progreso total
const TRAMOS = [
  [0.1, 0.37],
  [0.37, 0.64],
  [0.64, 0.9],
];

// Hacia dónde mira la "cámara" en cada momento: [progreso, y del foco, zoom]
const CAMARA = [
  [0, 440, 1.15],
  [0.1, 210, 1.5],
  [0.3, 210, 1.5],
  [0.4, 430, 1.5],
  [0.57, 430, 1.5],
  [0.67, 660, 1.45],
  [0.86, 660, 1.45],
  [0.96, 440, 1.15],
];

// Posiciones fijas de los granos y de la molienda (desfasados para que no caigan todos juntos)
const GRANOS = [
  [176, 0], [214, 0.22], [196, 0.45], [228, 0.68], [184, 0.12], [206, 0.84], [168, 0.56], [222, 0.33],
];
const MOLIENDA = Array.from({ length: 18 }, (_, i) => [192 + ((i * 7) % 17), (i * 0.37) % 1]);

const limitar = (valor, min = 0, max = 1) => Math.min(max, Math.max(min, valor));
const suave = (t) => t * t * (3 - 2 * t);
const tramo = (p, [inicio, fin]) => limitar((p - inicio) / (fin - inicio));

function camara(p) {
  for (let i = 0; i < CAMARA.length - 1; i++) {
    const [p1, y1, z1] = CAMARA[i];
    const [p2, y2, z2] = CAMARA[i + 1];
    if (p <= p2) {
      const t = suave(limitar((p - p1) / (p2 - p1)));
      return { y: y1 + (y2 - y1) * t, zoom: z1 + (z2 - z1) * t };
    }
  }
  return { y: 440, zoom: 1.15 };
}

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
      aria-labelledby="titulo-portada"
      className="relative h-[420vh] bg-tostado text-crema motion-reduce:h-auto"
    >
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div className="mx-auto grid h-full max-w-7xl grid-rows-[minmax(0,1fr)] lg:grid-cols-[1fr_1.1fr] motion-reduce:grid-rows-none">
          {/* Textos: uno visible a la vez, según el paso */}
          <div className="relative z-10 flex h-full items-end px-4 pb-10 sm:px-6 lg:items-center lg:pb-0 motion-reduce:items-start motion-reduce:py-16">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-tostado via-tostado to-transparent lg:hidden motion-reduce:hidden" />
            <div className="relative grid w-full [grid-template-areas:'capa'] motion-reduce:block motion-reduce:space-y-10">
              <Panel visible={enIntro || sinMovimiento}>
                <h1 id="titulo-portada" className="font-display text-5xl leading-[0.95] sm:text-7xl">
                  Del grano a tu taza
                </h1>
                <p className="mt-6 max-w-md text-lg text-kraft">
                  Café de especialidad tostado cada semana en Buenos Aires.
                  {!sinMovimiento && " Bajá para ver el recorrido."}
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
                  <a href="#elegi" tabIndex={enFinal || sinMovimiento ? 0 : -1} className="boton bg-crema text-tostado hover:bg-kraft">
                    Hacer el test
                  </a>
                  <Link
                    href="/productos"
                    tabIndex={enFinal || sinMovimiento ? 0 : -1}
                    className="boton-secundario text-crema"
                  >
                    Ver todos los productos
                  </Link>
                </div>
              </Panel>
            </div>
          </div>

          {/* Dibujo: decorativo, los textos ya cuentan lo que pasa */}
          <div className="absolute inset-x-0 top-0 bottom-[38%] lg:relative lg:inset-auto lg:h-full motion-reduce:hidden lg:motion-reduce:block">
            <Escena progreso={progreso} />
          </div>
        </div>

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

function Escena({ progreso }) {
  const grano = tramo(progreso, TRAMOS[0]);
  const molido = tramo(progreso, TRAMOS[1]);
  const taza = tramo(progreso, TRAMOS[2]);
  const vapor = tramo(progreso, [0.86, 0.98]);
  const { y, zoom } = camara(progreso);

  // Niveles de llenado (en unidades del dibujo)
  const nivelTolva = suave(grano) * 70;
  const nivelFiltro = suave(molido) * 30;
  const nivelVaso = suave(limitar((taza - 0.12) / 0.88)) * 92;
  const superficieVaso = 740 - nivelVaso;
  // El chorro baja al empezar el paso 3 y se corta al final
  const finChorro = 508 + limitar(taza * 5) * (superficieVaso - 508);
  const inicioChorro = 508 + limitar((taza - 0.85) / 0.15) * (superficieVaso - 508);

  return (
    <svg
      viewBox="0 0 400 900"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="h-full w-full"
    >
      <defs>
        <clipPath id="clip-tolva">
          <path d="M137 72 H263 L227 163 H173 Z" />
        </clipPath>
        <clipPath id="clip-filtro">
          <path d="M141 443 H259 V458 Q259 489 228 489 H172 Q141 489 141 458 Z" />
        </clipPath>
        <clipPath id="clip-vaso">
          <path d="M143 609 H257 L247 721 Q244 739 226 739 H174 Q156 739 153 721 Z" />
        </clipPath>
      </defs>

      <g transform={`translate(200 450) scale(${zoom}) translate(-200 ${-y})`}>
        {/* Granos cayendo a la tolva */}
        {grano > 0 &&
          grano < 1 &&
          GRANOS.map(([x, desfase], i) => {
            const caida = (grano * 2.6 + desfase) % 1;
            return <Grano key={i} x={x} y={-40 + caida * (160 - nivelTolva)} giro={caida * 220 + i * 40} />;
          })}

        {/* Molinillo */}
        <g clipPath="url(#clip-tolva)">
          <rect x="130" y={163 - nivelTolva} width="140" height={nivelTolva} fill="#7a4b30" />
          {nivelTolva > 12 &&
            [158, 182, 206, 230].map((x, i) => (
              <Grano key={x} x={x + (i % 2) * 6} y={170 - nivelTolva + 10} giro={i * 50} />
            ))}
        </g>
        <path d="M135 70 H265 L228 165 H172 Z" fill="#f3ebdd" fillOpacity="0.06" stroke="#f3ebdd" strokeWidth="3" strokeLinejoin="round" />
        <rect x="164" y="165" width="72" height="14" rx="3" fill="#d6c1a0" />
        <rect x="150" y="179" width="100" height="120" rx="16" fill="#3d2a1f" stroke="#f3ebdd" strokeWidth="3" />
        <circle cx="200" cy="232" r="24" fill="none" stroke="#d6c1a0" strokeWidth="3" />
        <circle cx="200" cy="232" r="6" fill="#d6c1a0" transform={`rotate(${molido * 720} 200 232)`} />
        <path d="M188 299 H212 V322 H188 Z" fill="#d6c1a0" />

        {/* Molienda cayendo al portafiltro */}
        {molido > 0 &&
          molido < 1 &&
          MOLIENDA.map(([x, desfase], i) => {
            const caida = (molido * 3 + desfase) % 1;
            const abrir = (x - 200) * caida * 0.8;
            return <circle key={i} cx={x + abrir} cy={326 + caida * (486 - nivelFiltro - 326)} r="2.4" fill="#b58a62" />;
          })}

        {/* Portafiltro */}
        <g clipPath="url(#clip-filtro)">
          <rect x="138" y={489 - nivelFiltro} width="124" height={nivelFiltro} fill="#8a5c3c" />
        </g>
        <path
          d="M138 440 H262 V458 Q262 492 228 492 H172 Q138 492 138 458 Z"
          fill="none"
          stroke="#f3ebdd"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect x="130" y="434" width="140" height="8" rx="4" fill="#d6c1a0" />
        <path d="M262 452 L366 447 Q380 447 380 457 Q380 467 366 467 L262 464 Z" fill="#d6c1a0" />
        <rect x="183" y="492" width="10" height="16" rx="2" fill="#f3ebdd" />
        <rect x="207" y="492" width="10" height="16" rx="2" fill="#f3ebdd" />

        {/* Chorro de espresso */}
        {taza > 0 && finChorro > inicioChorro && (
          <g stroke="#c58b55" strokeWidth="3.5" strokeLinecap="round">
            <line x1="188" y1={inicioChorro} x2="191" y2={finChorro} />
            <line x1="212" y1={inicioChorro} x2="209" y2={finChorro} />
          </g>
        )}

        {/* Vaso de doble vidrio con el café llenándose */}
        <g clipPath="url(#clip-vaso)">
          <rect x="140" y={superficieVaso} width="120" height={nivelVaso} fill="#6b3f26" />
          <rect x="140" y={superficieVaso} width="120" height={Math.min(9, nivelVaso)} fill="#d6a06a" />
        </g>
        <path
          d="M130 600 H270 L258 730 Q255 752 230 752 H170 Q145 752 142 730 Z"
          fill="#f3ebdd"
          fillOpacity="0.05"
          stroke="#f3ebdd"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M142 608 H258 L248 722 Q245 740 226 740 H174 Q155 740 152 722 Z"
          fill="none"
          stroke="#f3ebdd"
          strokeOpacity="0.45"
          strokeWidth="2"
        />
        <ellipse cx="200" cy="762" rx="90" ry="6" fill="#000" fillOpacity="0.25" />

        {/* Vapor: sube con el scroll al final */}
        <g
          fill="none"
          stroke="#f3ebdd"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={vapor * 0.7}
          transform={`translate(0 ${-vapor * 24})`}
        >
          <path d="M176 590 q-10 -16 0 -32 q10 -16 0 -32" />
          <path d="M200 584 q-10 -16 0 -32 q10 -16 0 -32 q-10 -16 0 -32" />
          <path d="M224 590 q-10 -16 0 -32 q10 -16 0 -32" />
        </g>
      </g>
    </svg>
  );
}

function Grano({ x, y, giro }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <ellipse rx="9" ry="13" fill="#9a6a45" />
      <path d="M-1 -11 C 4 -4 -4 4 1 11" fill="none" stroke="#3d2a1f" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}
