// Datos de ejemplo mientras no hay base de datos.
// Respetan el modelo de CLAUDE.md: en E5 se reemplazan por consultas a Supabase.
// imagen_url queda en null hasta tener las fotos (ver "Pendientes" en CLAUDE.md).

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

export const MOLIENDAS = [
  { id: "grano entero", nombre: "Grano entero", uso: "para moler en casa" },
  { id: "fina", nombre: "Fina", uso: "espresso" },
  { id: "media-fina", nombre: "Media-fina", uso: "moka / italiana" },
  { id: "media", nombre: "Media", uso: "filtro / V60" },
  { id: "gruesa", nombre: "Gruesa", uso: "prensa francesa" },
];

export const CAFES = [
  {
    id: 1,
    nombre: "Etiopía Yirgacheffe",
    slug: "etiopia-yirgacheffe",
    categoria: "cafe",
    origen: "Etiopía",
    region: "Yirgacheffe, Sidama",
    altura: "1.900 a 2.200 m",
    proceso: "Lavado",
    variedad: "Heirloom etíope",
    perfil: "frutal",
    tostado: "claro",
    acidez: 5,
    cuerpo: 2,
    notas: ["jazmín", "limón", "bergamota"],
    descripcion:
      "Un clásico de la cuna del café. Lavado y de altura, con una taza delicada, floral y cítrica que se luce en métodos de filtro.",
    imagen_url: null,
    activo: true,
    variantes: [
      { id: 101, peso_gramos: 250, precio: 19500, stock: 14 },
      { id: 102, peso_gramos: 500, precio: 36000, stock: 8 },
      { id: 103, peso_gramos: 1000, precio: 68000, stock: 3 },
    ],
    resenas: [
      { autor: "Lucía M.", puntaje: 5, texto: "En V60 es otra cosa. Floral de verdad, nunca había probado algo así." },
      { autor: "Martín R.", puntaje: 5, texto: "Llegó con fecha de tostado de dos días antes. Se nota la frescura." },
      { autor: "Carla S.", puntaje: 4, texto: "Muy rico, aunque para mi gusto un poco ácido en prensa francesa." },
    ],
  },
  {
    id: 2,
    nombre: "Kenia AA",
    slug: "kenia-aa",
    categoria: "cafe",
    origen: "Kenia",
    region: "Nyeri",
    altura: "1.700 a 1.900 m",
    proceso: "Lavado",
    variedad: "SL28 y SL34",
    perfil: "frutal",
    tostado: "claro",
    acidez: 5,
    cuerpo: 3,
    notas: ["frutos rojos", "grosella", "pomelo"],
    descripcion:
      "Granos de la clasificación más alta de Kenia. Jugoso y brillante, con una acidez que recuerda a los frutos rojos.",
    imagen_url: null,
    activo: true,
    variantes: [
      { id: 201, peso_gramos: 250, precio: 20500, stock: 10 },
      { id: 202, peso_gramos: 500, precio: 38000, stock: 0 },
      { id: 203, peso_gramos: 1000, precio: 72000, stock: 4 },
    ],
    resenas: [
      { autor: "Federico P.", puntaje: 5, texto: "Parece jugo de frutos rojos. Mi favorito para la Chemex." },
      { autor: "Ana L.", puntaje: 4, texto: "Intenso y frutal. Lo recomiendo para quien ya toma café de especialidad." },
    ],
  },
  {
    id: 3,
    nombre: "Colombia Huila",
    slug: "colombia-huila",
    categoria: "cafe",
    origen: "Colombia",
    region: "Huila",
    altura: "1.600 a 1.900 m",
    proceso: "Lavado",
    variedad: "Caturra y Castillo",
    perfil: "equilibrado",
    tostado: "medio",
    acidez: 3,
    cuerpo: 3,
    notas: ["caramelo", "manzana roja", "panela"],
    descripcion:
      "De las montañas del sur de Colombia. Dulce y redondo, con notas a caramelo y manzana: el café de todos los días.",
    imagen_url: null,
    activo: true,
    variantes: [
      { id: 301, peso_gramos: 250, precio: 16500, stock: 20 },
      { id: 302, peso_gramos: 500, precio: 30500, stock: 15 },
      { id: 303, peso_gramos: 1000, precio: 57000, stock: 9 },
    ],
    resenas: [
      { autor: "Sofía G.", puntaje: 5, texto: "Lo tomo en moka todas las mañanas. Dulce, sin amargor." },
      { autor: "Diego F.", puntaje: 5, texto: "Excelente relación precio-calidad. Ya voy por la tercera bolsa." },
      { autor: "Paula N.", puntaje: 4, texto: "Muy equilibrado, ideal para arrancar en el café de especialidad." },
    ],
  },
  {
    id: 4,
    nombre: "Guatemala Antigua",
    slug: "guatemala-antigua",
    categoria: "cafe",
    origen: "Guatemala",
    region: "Antigua",
    altura: "1.500 a 1.700 m",
    proceso: "Lavado",
    variedad: "Bourbon",
    perfil: "equilibrado",
    tostado: "medio",
    acidez: 3,
    cuerpo: 3,
    notas: ["chocolate", "canela", "nuez"],
    descripcion:
      "Cultivado entre volcanes en Antigua. Una taza cálida con chocolate y especias, que funciona igual de bien solo o con leche.",
    imagen_url: null,
    activo: true,
    variantes: [
      { id: 401, peso_gramos: 250, precio: 17000, stock: 12 },
      { id: 402, peso_gramos: 500, precio: 31500, stock: 6 },
      { id: 403, peso_gramos: 1000, precio: 59000, stock: 2 },
    ],
    resenas: [
      { autor: "Joaquín T.", puntaje: 5, texto: "Con leche queda espectacular, sale un cortado con gusto a chocolate." },
      { autor: "Valentina C.", puntaje: 4, texto: "Rico y especiado. El envío llegó en un día a Palermo." },
    ],
  },
  {
    id: 5,
    nombre: "Brasil Cerrado",
    slug: "brasil-cerrado",
    categoria: "cafe",
    origen: "Brasil",
    region: "Cerrado Mineiro",
    altura: "1.000 a 1.200 m",
    proceso: "Natural",
    variedad: "Mundo Novo y Catuaí",
    perfil: "intenso",
    tostado: "medio-oscuro",
    acidez: 2,
    cuerpo: 4,
    notas: ["chocolate", "maní tostado", "dulce de leche"],
    descripcion:
      "Natural de la meseta del Cerrado Mineiro. Cuerpo cremoso, acidez baja y un final largo a chocolate y maní.",
    imagen_url: null,
    activo: true,
    variantes: [
      { id: 501, peso_gramos: 250, precio: 15000, stock: 25 },
      { id: 502, peso_gramos: 500, precio: 28000, stock: 18 },
      { id: 503, peso_gramos: 1000, precio: 52000, stock: 11 },
    ],
    resenas: [
      { autor: "Nicolás B.", puntaje: 5, texto: "Para espresso es perfecto. Crema espesa y nada de acidez." },
      { autor: "Florencia D.", puntaje: 5, texto: "Gusto a chocolate con maní, tal cual dice la descripción." },
      { autor: "Tomás A.", puntaje: 4, texto: "Muy bueno con leche. Lo pido en 1 kg y me dura el mes." },
    ],
  },
  {
    id: 6,
    nombre: "Blend Espresso",
    slug: "blend-espresso",
    categoria: "cafe",
    origen: "Brasil y Colombia",
    region: "Cerrado Mineiro y Huila",
    altura: "1.000 a 1.900 m",
    proceso: "Natural y lavado",
    variedad: "Blend de la casa",
    perfil: "intenso",
    tostado: "oscuro",
    acidez: 1,
    cuerpo: 5,
    notas: ["cacao amargo", "melaza", "nuez tostada"],
    descripcion:
      "Nuestro blend de la casa, pensado para la cafetera espresso. Intenso, con mucho cuerpo y un amargor de cacao que se banca la leche.",
    imagen_url: null,
    activo: true,
    variantes: [
      { id: 601, peso_gramos: 250, precio: 13500, stock: 30 },
      { id: 602, peso_gramos: 500, precio: 25000, stock: 22 },
      { id: 603, peso_gramos: 1000, precio: 46000, stock: 14 },
    ],
    resenas: [
      { autor: "Gonzalo V.", puntaje: 5, texto: "El mejor blend que probé para capuchino. Potente y parejo." },
      { autor: "Micaela R.", puntaje: 4, texto: "Fuerte como me gusta. La molienda fina vino perfecta para mi cafetera." },
    ],
  },
];

export function obtenerCafes() {
  return CAFES.filter((cafe) => cafe.activo);
}

export function obtenerCafePorSlug(slug) {
  return obtenerCafes().find((cafe) => cafe.slug === slug);
}

export function obtenerPerfil(id) {
  return PERFILES.find((perfil) => perfil.id === id);
}

export function precioDesde(cafe) {
  return Math.min(...cafe.variantes.map((variante) => variante.precio));
}

export function tieneStock(cafe) {
  return cafe.variantes.some((variante) => variante.stock > 0);
}

export function promedioResenas(cafe) {
  const total = cafe.resenas.reduce((suma, resena) => suma + resena.puntaje, 0);
  return total / cafe.resenas.length;
}

export function nombrePeso(gramos) {
  return gramos >= 1000 ? `${gramos / 1000} kg` : `${gramos} g`;
}
