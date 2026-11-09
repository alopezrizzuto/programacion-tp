// Catálogo chico y fijo para los tests unitarios: así no dependen de la base
// y los números de cada cuenta se pueden verificar a mano.

export const ETIOPIA = {
  id: 1,
  categoria: "cafe",
  nombre: "Etiopía Yirgacheffe",
  slug: "etiopia-yirgacheffe",
  origen: "Etiopía",
  perfil: "frutal",
  tostado: "claro",
  acidez: 5,
  cuerpo: 2,
  notas: ["florales", "cítricas"],
  resenas: [{ puntaje: 5 }, { puntaje: 4 }],
  variantes: [
    { id: 11, nombre: "250 g", peso_gramos: 250, precio: 20000, stock: 10 },
    { id: 12, nombre: "500 g", peso_gramos: 500, precio: 36000, stock: 0 },
  ],
};

export const GUATEMALA = {
  id: 2,
  categoria: "cafe",
  nombre: "Guatemala Antigua",
  slug: "guatemala-antigua",
  origen: "Guatemala",
  perfil: "equilibrado",
  tostado: "medio",
  acidez: 3,
  cuerpo: 3,
  notas: ["chocolate", "especias"],
  resenas: [{ puntaje: 5 }],
  variantes: [{ id: 21, nombre: "250 g", peso_gramos: 250, precio: 25000, stock: 3 }],
};

export const BLEND = {
  id: 3,
  categoria: "cafe",
  nombre: "Blend Espresso",
  slug: "blend-espresso",
  origen: "Brasil y Colombia",
  perfil: "intenso",
  tostado: "oscuro",
  acidez: 1,
  cuerpo: 5,
  notas: ["cacao amargo"],
  resenas: [],
  variantes: [{ id: 31, nombre: "1 kg", peso_gramos: 1000, precio: 70000, stock: 4 }],
};

export const BALANZA = {
  id: 4,
  categoria: "accesorio",
  nombre: "Balanza con timer",
  slug: "balanza-con-timer",
  descripcion_corta: "Pesá el café y el agua con precisión",
  origen: null,
  perfil: null,
  tostado: null,
  acidez: null,
  cuerpo: null,
  notas: null,
  resenas: [],
  variantes: [{ id: 41, nombre: "Unidad", peso_gramos: null, precio: 30000, stock: 5 }],
};

export const PRODUCTOS = [ETIOPIA, GUATEMALA, BLEND, BALANZA];
export const CAFES = [ETIOPIA, GUATEMALA, BLEND];
