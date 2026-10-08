// Lógica del test "Elegí tu café ideal": reglas y puntaje, sin IA.
// Es una función pura (mismos datos de entrada, mismo resultado), así en E3
// se puede mover tal cual al Route Handler POST /api/recomendacion.

import { obtenerCafes, promedioResenas } from "./cafes";

// Las preguntas usan palabras de todos los días: nadie tiene que saber qué es un "perfil frutal"
export const PREGUNTAS = [
  {
    id: "intensidad",
    titulo: "¿Cómo te gusta el café?",
    opciones: [
      { id: "suave", nombre: "Suave" },
      { id: "medio", nombre: "Medio" },
      { id: "fuerte", nombre: "Fuerte" },
    ],
  },
  {
    id: "acidez",
    titulo: "¿Te gusta que sea ácido?",
    ayuda: "La acidez es ese gusto vivo que tiene una fruta, como una manzana o una naranja.",
    opciones: [
      { id: "poco", nombre: "Poco" },
      { id: "algo", nombre: "Algo" },
      { id: "mucho", nombre: "Mucho" },
    ],
  },
  {
    id: "leche",
    titulo: "¿Cómo lo tomás?",
    opciones: [
      { id: "solo", nombre: "Solo" },
      { id: "con-leche", nombre: "Con leche" },
    ],
  },
  {
    id: "metodo",
    titulo: "¿Cómo lo preparás?",
    opciones: [
      { id: "espresso", nombre: "Cafetera espresso", molienda: "fina" },
      { id: "moka", nombre: "Moka o italiana", molienda: "media-fina" },
      { id: "filtro", nombre: "Filtro o V60", molienda: "media" },
      { id: "prensa", nombre: "Prensa francesa", molienda: "gruesa" },
      { id: "propio", nombre: "Lo muelo yo", molienda: "grano entero" },
    ],
  },
];

// Qué tan intenso se siente cada café según su tostado (1 suave, 3 fuerte).
// El tueste medio se percibe más cerca de "suave" que de "fuerte": no es amargo.
const INTENSIDAD_TOSTADO = { claro: 1, medio: 1.5, "medio-oscuro": 3, oscuro: 3 };
const INTENSIDAD_ELEGIDA = { suave: 1, medio: 2, fuerte: 3 };
const ACIDEZ_ELEGIDA = { poco: 1.5, algo: 3, mucho: 5 };

// Cada regla devuelve los puntos que suma un café y, si encaja bien, el motivo
const REGLAS = {
  intensidad(cafe, respuesta) {
    const distancia = Math.abs(INTENSIDAD_TOSTADO[cafe.tostado] - INTENSIDAD_ELEGIDA[respuesta]);
    return { puntos: 3 - distancia * 1.5, motivo: distancia <= 0.5 ? `tiene la intensidad que buscás (${respuesta})` : null };
  },
  acidez(cafe, respuesta) {
    const distancia = Math.abs(cafe.acidez - ACIDEZ_ELEGIDA[respuesta]);
    const nivel = { poco: "baja", algo: "media", mucho: "alta" }[respuesta];
    return { puntos: Math.max(0, 3 - distancia), motivo: distancia <= 1 ? `tiene acidez ${nivel}` : null };
  },
  leche(cafe, respuesta) {
    if (respuesta === "con-leche") {
      if (cafe.cuerpo >= 4) return { puntos: 2, motivo: "tiene cuerpo para bancarse la leche" };
      return { puntos: cafe.cuerpo === 3 ? 1 : 0, motivo: null };
    }
    return { puntos: cafe.cuerpo <= 3 ? 1 : 0, motivo: null };
  },
  metodo(cafe, respuesta) {
    const encaja = {
      espresso: cafe.cuerpo >= 4,
      moka: cafe.perfil === "equilibrado",
      filtro: cafe.acidez >= 4,
      prensa: cafe.cuerpo >= 3,
      propio: false,
    }[respuesta];
    const metodo = { espresso: "espresso", moka: "moka", filtro: "filtro", prensa: "prensa francesa" }[respuesta];
    return { puntos: encaja ? 1 : 0, motivo: encaja ? `se luce en ${metodo}` : null };
  },
};
const PUNTAJE_MAXIMO = 3 + 3 + 2 + 1;

// Devuelve un mensaje de error si faltan respuestas o alguna no existe, o null si está todo bien.
export function validarRespuestas(respuestas) {
  if (!respuestas || typeof respuestas !== "object") return "Las respuestas no son válidas.";
  const faltan = PREGUNTAS.filter((pregunta) => !respuestas[pregunta.id]);
  if (faltan.length > 0) return `Falta responder: ${faltan.map((p) => p.titulo).join(" ")}`;
  const invalida = PREGUNTAS.find(
    (pregunta) => !pregunta.opciones.some((opcion) => opcion.id === respuestas[pregunta.id])
  );
  if (invalida) return `La respuesta a "${invalida.titulo}" no es válida.`;
  return null;
}

// Devuelve los 3 cafés que mejor encajan, con el porcentaje, los motivos y la molienda sugerida.
export function recomendar(respuestas) {
  const molienda = PREGUNTAS.find((p) => p.id === "metodo").opciones.find((o) => o.id === respuestas.metodo).molienda;

  return obtenerCafes()
    .map((cafe) => {
      const resultados = PREGUNTAS.map((pregunta) => REGLAS[pregunta.id](cafe, respuestas[pregunta.id]));
      const puntaje = resultados.reduce((suma, r) => suma + r.puntos, 0);
      return {
        cafe,
        puntaje,
        coincidencia: Math.round((puntaje / PUNTAJE_MAXIMO) * 100),
        motivos: resultados.map((r) => r.motivo).filter(Boolean),
        molienda,
      };
    })
    // Más puntaje primero; si empatan, el mejor valorado
    .sort((a, b) => b.puntaje - a.puntaje || promedioResenas(b.cafe) - promedioResenas(a.cafe))
    .slice(0, 3);
}
