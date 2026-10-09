// Reglas del formulario de productos del panel admin. Igual que lib/auth.js:
// las usa el navegador (para avisar antes de guardar) y la API (para no confiar en lo que llega).
// La base tiene sus propios CHECK como última barrera.

import { PERFILES, TOSTADOS, nombrePeso } from "./productos";

export const TAMANO_MAXIMO_IMAGEN = 4 * 1024 * 1024; // 4 MB
export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];

// "Etiopía Yirgacheffe" → "etiopia-yirgacheffe" (la dirección de la página del producto)
export function crearSlug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function texto(valor) {
  return String(valor ?? "").trim();
}

function textoONulo(valor) {
  return texto(valor) || null;
}

function lista(valor) {
  return Array.isArray(valor) ? valor.map(texto).filter(Boolean) : [];
}

function entero(valor) {
  return valor === "" || valor === null || valor === undefined ? NaN : Number(valor);
}

// Deja los datos con la forma exacta de la tabla. Los campos que no corresponden
// a la categoría se vacían (un accesorio no tiene tostado, un café no tiene especificaciones).
export function normalizarProducto(datos) {
  const esCafe = datos.categoria === "cafe";
  return {
    categoria: datos.categoria === "accesorio" ? "accesorio" : "cafe",
    nombre: texto(datos.nombre),
    slug: texto(datos.slug).toLowerCase(),
    descripcion: texto(datos.descripcion),
    descripcion_corta: esCafe ? null : textoONulo(datos.descripcion_corta),
    imagen_url: textoONulo(datos.imagen_url),
    activo: datos.activo !== false,

    origen: esCafe ? textoONulo(datos.origen) : null,
    region: esCafe ? textoONulo(datos.region) : null,
    altura: esCafe ? textoONulo(datos.altura) : null,
    proceso: esCafe ? textoONulo(datos.proceso) : null,
    variedad: esCafe ? textoONulo(datos.variedad) : null,
    perfil: esCafe ? textoONulo(datos.perfil) : null,
    tostado: esCafe ? textoONulo(datos.tostado) : null,
    acidez: esCafe ? entero(datos.acidez) : null,
    cuerpo: esCafe ? entero(datos.cuerpo) : null,
    notas: esCafe ? lista(datos.notas) : [],

    beneficios: esCafe ? [] : lista(datos.beneficios),
    especificaciones: esCafe
      ? []
      : (Array.isArray(datos.especificaciones) ? datos.especificaciones : [])
          .map((par) => [texto(par?.[0]), texto(par?.[1])])
          .filter(([dato, valor]) => dato || valor),

    // En los cafés el nombre de la variante sale del peso ("250 g"); en los accesorios se escribe
    variantes: (Array.isArray(datos.variantes) ? datos.variantes : []).map((variante) => ({
      id: Number(variante.id) || undefined,
      nombre: esCafe ? (entero(variante.peso_gramos) > 0 ? nombrePeso(entero(variante.peso_gramos)) : "") : texto(variante.nombre),
      peso_gramos: esCafe ? entero(variante.peso_gramos) : null,
      precio: entero(variante.precio),
      stock: entero(variante.stock),
    })),
  };
}

const esEnteroEntre = (valor, minimo, maximo = Infinity) => Number.isInteger(valor) && valor >= minimo && valor <= maximo;

// Devuelve { campo: mensaje } con los errores, en el orden del formulario.
// Los de variantes usan claves como "variantes.0.precio" (variante 0, campo precio).
export function validarProducto(producto) {
  const urlImagenes = urlImagenesSupabase();
  const errores = {};
  const requerido = (campo, mensaje) => {
    if (!producto[campo]) errores[campo] = mensaje;
  };

  if (producto.nombre.length < 2 || producto.nombre.length > 80) errores.nombre = "El nombre tiene que tener entre 2 y 80 caracteres.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(producto.slug)) {
    errores.slug = "Solo letras minúsculas sin tilde, números y guiones (por ejemplo: kenia-aa).";
  }
  if (producto.descripcion.length < 20) errores.descripcion = "Escribí una descripción de al menos 20 caracteres.";

  // La foto tiene que venir de nuestro bucket (o de /public); así no se cuelan links de otros sitios
  const esLocal = /^\/[^/]/.test(producto.imagen_url ?? ""); // "/cafes/kenia.jpg" sí, "//otro-sitio.com" no
  if (producto.imagen_url && !esLocal && !producto.imagen_url.startsWith(urlImagenes)) {
    errores.imagen_url = "La foto tiene que subirse desde este formulario.";
  }

  if (producto.categoria === "cafe") {
    requerido("origen", "Indicá el país de origen.");
    requerido("region", "Indicá la región.");
    requerido("altura", "Indicá la altura (por ejemplo: 1.600 a 1.900 m).");
    requerido("proceso", "Indicá el proceso (por ejemplo: Lavado).");
    requerido("variedad", "Indicá la variedad.");
    if (!PERFILES.some((perfil) => perfil.id === producto.perfil)) errores.perfil = "Elegí un perfil.";
    if (!TOSTADOS.includes(producto.tostado)) errores.tostado = "Elegí un tostado.";
    if (!esEnteroEntre(producto.acidez, 1, 5)) errores.acidez = "La acidez va de 1 a 5.";
    if (!esEnteroEntre(producto.cuerpo, 1, 5)) errores.cuerpo = "El cuerpo va de 1 a 5.";
    if (producto.notas.length === 0) errores.notas = "Agregá al menos una nota de sabor.";
  } else {
    requerido("descripcion_corta", "Escribí una descripción corta para la tarjeta del producto.");
    if (producto.beneficios.length === 0) errores.beneficios = "Agregá al menos un beneficio.";
    if (producto.especificaciones.some(([dato, valor]) => !dato || !valor)) {
      errores.especificaciones = 'Cada especificación va en una línea con el formato "Dato: valor".';
    }
  }

  if (producto.variantes.length === 0) errores.variantes = "Agregá al menos una variante con su precio y stock.";
  const pesos = new Set();
  producto.variantes.forEach((variante, i) => {
    if (producto.categoria === "cafe") {
      if (!esEnteroEntre(variante.peso_gramos, 1)) errores[`variantes.${i}.peso_gramos`] = "Peso en gramos (ej.: 250).";
      else if (pesos.has(variante.peso_gramos)) errores[`variantes.${i}.peso_gramos`] = "Ese peso ya está en otra variante.";
      pesos.add(variante.peso_gramos);
    } else if (!variante.nombre) {
      errores[`variantes.${i}.nombre`] = "Poné un nombre (ej.: Set x2).";
    }
    if (!esEnteroEntre(variante.precio, 1)) errores[`variantes.${i}.precio`] = "Precio en pesos, sin centavos.";
    if (!esEnteroEntre(variante.stock, 0)) errores[`variantes.${i}.stock`] = "Stock: 0 o más.";
  });

  return errores;
}

// La dirección pública del bucket de fotos. NEXT_PUBLIC_: existe también en el navegador
export function urlImagenesSupabase() {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/`;
}
