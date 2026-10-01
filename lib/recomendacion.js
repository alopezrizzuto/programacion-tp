// Lógica del test "Elegí tu café ideal": reglas y puntaje, sin IA.
// Es una función pura (mismos datos de entrada, mismo resultado), así en E3
// se puede mover tal cual al Route Handler POST /api/recomendacion.

import { obtenerCafes, promedioResenas } from "./cafes";

export const MIN_PREFERENCIAS = 2;
export const MAX_PREFERENCIAS = 3;

// Cada preferencia suma puntos a ciertos cafés y explica por qué.
// "molienda" sugiere cómo molerlo si la preferencia es un método de preparación.
export const PREFERENCIAS = [
  {
    id: "frutal",
    grupo: "sabor",
    nombre: "Frutal y cítrico",
    puntos: (cafe) => (cafe.perfil === "frutal" ? 3 : 0),
    motivo: "tiene notas frutales y acidez brillante",
  },
  {
    id: "chocolate",
    grupo: "sabor",
    nombre: "Chocolate y caramelo",
    puntos: (cafe) => ({ equilibrado: 2, intenso: 2 })[cafe.perfil] ?? 0,
    motivo: "tiene notas dulces a chocolate o caramelo",
  },
  {
    id: "suave",
    grupo: "sabor",
    nombre: "Suave, sin amargor",
    puntos: (cafe) => (cafe.tostado === "medio" ? 3 : cafe.tostado === "claro" ? 1 : 0),
    motivo: "es redondo y sin amargor",
  },
  {
    id: "intenso",
    grupo: "sabor",
    nombre: "Intenso, con cuerpo",
    puntos: (cafe) => (cafe.cuerpo >= 4 ? 3 : 0),
    motivo: "tiene mucho cuerpo",
  },
  {
    id: "leche",
    grupo: "preparacion",
    nombre: "Lo tomo con leche",
    puntos: (cafe) => (cafe.cuerpo >= 4 ? 2 : cafe.cuerpo === 3 ? 1 : 0),
    motivo: "se banca la leche sin perderse",
  },
  {
    id: "espresso",
    grupo: "preparacion",
    nombre: "Cafetera espresso",
    molienda: "fina",
    puntos: (cafe) => ({ intenso: 2, equilibrado: 1 })[cafe.perfil] ?? 0,
    motivo: "rinde muy bien en espresso",
  },
  {
    id: "filtro",
    grupo: "preparacion",
    nombre: "Filtro o V60",
    molienda: "media",
    puntos: (cafe) => ({ frutal: 2, equilibrado: 1 })[cafe.perfil] ?? 0,
    motivo: "se luce en métodos de filtro",
  },
  {
    id: "moka",
    grupo: "preparacion",
    nombre: "Moka o italiana",
    molienda: "media-fina",
    puntos: (cafe) => ({ equilibrado: 2, intenso: 1 })[cafe.perfil] ?? 0,
    motivo: "queda dulce y parejo en moka",
  },
  {
    id: "prensa",
    grupo: "preparacion",
    nombre: "Prensa francesa",
    molienda: "gruesa",
    puntos: (cafe) => ({ equilibrado: 1, intenso: 2 })[cafe.perfil] ?? 0,
    motivo: "gana cuerpo en prensa francesa",
  },
];

// Devuelve un mensaje de error si la selección no es válida, o null si está bien.
export function validarPreferencias(ids) {
  if (!Array.isArray(ids)) return "La selección no es válida.";
  const validas = ids.filter((id) => PREFERENCIAS.some((p) => p.id === id));
  if (validas.length !== ids.length) return "Hay una opción que no existe.";
  if (ids.length < MIN_PREFERENCIAS) return `Elegí al menos ${MIN_PREFERENCIAS} opciones.`;
  if (ids.length > MAX_PREFERENCIAS) return `Elegí como máximo ${MAX_PREFERENCIAS} opciones.`;
  return null;
}

// Devuelve los 3 cafés con más puntaje, con los motivos y la molienda sugerida.
export function recomendar(ids) {
  const elegidas = PREFERENCIAS.filter((p) => ids.includes(p.id));
  const metodo = elegidas.find((p) => p.molienda);
  const maximo = elegidas.reduce((suma, p) => suma + Math.max(...obtenerCafes().map(p.puntos)), 0);

  return obtenerCafes()
    .map((cafe) => {
      const aportes = elegidas.filter((p) => p.puntos(cafe) > 0);
      const puntaje = elegidas.reduce((suma, p) => suma + p.puntos(cafe), 0);
      return {
        cafe,
        puntaje,
        coincidencia: maximo > 0 ? Math.round((puntaje / maximo) * 100) : 0,
        motivos: aportes.map((p) => p.motivo),
        molienda: metodo ? metodo.molienda : "grano entero",
      };
    })
    .filter((resultado) => resultado.puntaje > 0)
    // Más puntaje primero; si empatan, el mejor valorado
    .sort((a, b) => b.puntaje - a.puntaje || promedioResenas(b.cafe) - promedioResenas(a.cafe))
    .slice(0, 3);
}
