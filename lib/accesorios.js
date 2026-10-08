// Accesorios de ejemplo mientras no hay base de datos (en E5 pasan a Supabase,
// en la misma tabla productos con categoria = "accesorio").
// Tienen una sola variante y no llevan molienda. imagen_url queda en null hasta tener las fotos.

export const ACCESORIOS = [
  {
    id: 7,
    categoria: "accesorio",
    nombre: "Vasos de doble vidrio",
    slug: "vasos-doble-vidrio",
    icono: "vaso",
    corta: "Set x2 de 250 ml. El café se mantiene caliente y no te quemás la mano.",
    descripcion:
      "Dos vasos de vidrio borosilicato con doble pared: la cámara de aire mantiene la temperatura del café y deja el exterior frío al tacto. Se ven las capas de un cortado o la crema de un espresso.",
    beneficios: [
      "Mantiene el café caliente por más tiempo",
      "No te quemás la mano: el vidrio de afuera queda frío",
      "Aptos para lavavajillas y microondas",
    ],
    especificaciones: [
      ["Contenido", "2 vasos"],
      ["Capacidad", "250 ml cada uno"],
      ["Material", "Vidrio borosilicato de doble pared"],
      ["Cuidado", "Apto lavavajillas y microondas"],
    ],
    imagen_url: null,
    activo: true,
    variantes: [{ id: 701, nombre: "Set x2", precio: 18900, stock: 16 }],
    resenas: [
      { autor: "Camila R.", puntaje: 5, texto: "Hermosos. El cortado queda en capas y se ve increíble." },
      { autor: "Ignacio M.", puntaje: 5, texto: "El café tarda mucho más en enfriarse. Los uso todos los días." },
    ],
  },
  {
    id: 8,
    categoria: "accesorio",
    nombre: "Contenedor hermético al vacío",
    slug: "contenedor-al-vacio",
    icono: "contenedor",
    corta: "Para 500 g de grano. Saca el aire y conserva el aroma por semanas.",
    descripcion:
      "Un contenedor de acero con tapa de vacío: al cerrarlo, una válvula saca el aire que oxida el café. Tiene un fechador en la tapa para anotar el día que abriste la bolsa.",
    beneficios: [
      "Conserva el aroma hasta 4 veces más que la bolsa abierta",
      "Fechador en la tapa para saber cuándo la abriste",
      "Acero opaco: la luz tampoco llega al café",
    ],
    especificaciones: [
      ["Capacidad", "500 g de café en grano"],
      ["Material", "Acero inoxidable y tapa de vacío"],
      ["Medidas", "11 cm de diámetro, 18 cm de alto"],
      ["Extra", "Fechador de mes y día en la tapa"],
    ],
    imagen_url: null,
    activo: true,
    variantes: [{ id: 801, nombre: "500 g", precio: 24500, stock: 9 }],
    resenas: [
      { autor: "Rodrigo L.", puntaje: 5, texto: "La última semana de la bolsa ya no pierde aroma. Muy buena compra." },
      { autor: "Valeria P.", puntaje: 4, texto: "Funciona perfecto. La tapa es un poco dura al principio." },
    ],
  },
  {
    id: 9,
    categoria: "accesorio",
    nombre: "Tamping set",
    slug: "tamping-set",
    icono: "tamper",
    corta: "Tamper de 58 mm, distribuidor y base. Espresso parejo en cada tiro.",
    descripcion:
      "Todo lo que necesitás para preparar el portafiltro como en una cafetería: el distribuidor nivela el café molido y el tamper lo compacta de forma pareja para que el agua pase igual por todos lados.",
    beneficios: [
      "Extracciones parejas, sin canales de agua",
      "Tamper calibrado: siempre la misma presión",
      "Base de silicona que protege la mesada",
    ],
    especificaciones: [
      ["Incluye", "Tamper, distribuidor y base de silicona"],
      ["Medida", "58 mm (portafiltros estándar)"],
      ["Material", "Acero inoxidable y madera"],
      ["Tamper", "Calibrado a 15 kg de presión"],
    ],
    imagen_url: null,
    activo: true,
    variantes: [{ id: 901, nombre: "58 mm", precio: 38000, stock: 4 }],
    resenas: [
      { autor: "Matías G.", puntaje: 5, texto: "Cambió mis espressos. Ahora salen parejos y con mucha más crema." },
      { autor: "Lorena V.", puntaje: 5, texto: "Muy buena calidad, se siente sólido. Fijate que tu portafiltro sea de 58 mm." },
    ],
  },
  {
    id: 10,
    categoria: "accesorio",
    nombre: "Balanza con timer",
    slug: "balanza-con-timer",
    icono: "balanza",
    corta: "Precisión de 0,1 g y cronómetro. La receta exacta, todas las veces.",
    descripcion:
      "Pesá el café y el agua y medí el tiempo de extracción en el mismo lugar. Con la misma receta, el café sale igual de rico todos los días, en V60, prensa o espresso.",
    beneficios: [
      "Precisión de 0,1 g para recetas exactas",
      "Cronómetro integrado para medir la extracción",
      "Se carga por USB, sin pilas",
    ],
    especificaciones: [
      ["Capacidad", "Hasta 3 kg"],
      ["Precisión", "0,1 g"],
      ["Funciones", "Tara y cronómetro"],
      ["Carga", "USB-C, batería recargable"],
    ],
    imagen_url: null,
    activo: true,
    variantes: [{ id: 1001, nombre: "Única", precio: 29900, stock: 12 }],
    resenas: [
      { autor: "Bruno S.", puntaje: 5, texto: "Desde que peso el café, la V60 me sale siempre igual. Imprescindible." },
      { autor: "Julieta A.", puntaje: 4, texto: "Muy precisa. El timer arranca solo cuando empezás a verter." },
    ],
  },
];

export function obtenerAccesorios() {
  return ACCESORIOS.filter((accesorio) => accesorio.activo);
}

export function obtenerAccesorioPorSlug(slug) {
  return obtenerAccesorios().find((accesorio) => accesorio.slug === slug);
}
