// Constantes y funciones de ayuda sobre productos. Los productos en sí viven en Supabase
// (ver lib/datos.js). Perfiles y moliendas quedan acá porque son listas fijas que
// coinciden con los CHECK de la base (supabase/migrations/001_esquema.sql).

export const PERFILES = [
  {
    id: "frutal",
    nombre: "Frutal y brillante",
    plural: "Frutales",
    idealPara: "Filtro, V60 y Chemex",
    corta: "Flores, cítricos y frutos rojos",
    descripcion: "Tostado claro, acidez vibrante y notas a flores y frutas. Ideal para filtro.",
  },
  {
    id: "equilibrado",
    nombre: "Equilibrado",
    plural: "Equilibrados",
    idealPara: "Moka, filtro y espresso",
    corta: "Caramelo, chocolate, dulzor redondo",
    descripcion: "Dulzor y acidez en armonía, con notas a caramelo y chocolate. Va con todo.",
  },
  {
    id: "intenso",
    nombre: "Intenso",
    plural: "Intensos",
    idealPara: "Espresso y con leche",
    corta: "Cacao y cuerpo para espresso y con leche",
    descripcion: "Mucho cuerpo, poca acidez y notas a cacao. Perfecto para espresso y con leche.",
  },
];

export const TOSTADOS = ["claro", "medio", "medio-oscuro", "oscuro"];

export const MOLIENDAS = [
  { id: "grano entero", nombre: "Grano entero", uso: "para moler en casa" },
  { id: "fina", nombre: "Fina", uso: "espresso" },
  { id: "media-fina", nombre: "Media-fina", uso: "moka / italiana" },
  { id: "media", nombre: "Media", uso: "filtro / V60" },
  { id: "gruesa", nombre: "Gruesa", uso: "prensa francesa" },
];

export function obtenerPerfil(id) {
  return PERFILES.find((perfil) => perfil.id === id);
}

export function precioDesde(producto) {
  return Math.min(...producto.variantes.map((variante) => variante.precio));
}

export function tieneStock(producto) {
  return producto.variantes.some((variante) => variante.stock > 0);
}

// 0 si todavía no tiene reseñas (por ejemplo, un producto recién cargado desde el admin)
export function promedioResenas(producto) {
  if (producto.resenas.length === 0) return 0;
  const total = producto.resenas.reduce((suma, resena) => suma + resena.puntaje, 0);
  return total / producto.resenas.length;
}

export function nombrePeso(gramos) {
  return gramos >= 1000 ? `${gramos / 1000} kg` : `${gramos} g`;
}
