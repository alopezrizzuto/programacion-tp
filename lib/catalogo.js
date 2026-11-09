// Búsqueda y filtros del catálogo. Lo usan la página /productos (Server Component) y la API
// GET /api/productos, así las dos filtran exactamente igual.
// Los filtros viajan en la URL: /productos?perfil=frutal&tostado=claro&q=chocolate
// Los que admiten varios valores se repiten: ?perfil=frutal&perfil=intenso

import { PERFILES, TOSTADOS } from "./productos.js";

// Acidez y cuerpo se guardan del 1 al 5; para elegir alcanza con tres niveles
export const NIVELES = [
  { id: "baja", nombre: "Baja", min: 1, max: 2 },
  { id: "media", nombre: "Media", min: 3, max: 3 },
  { id: "alta", nombre: "Alta", min: 4, max: 5 },
];

export const PESOS = [250, 500, 1000];

export const LARGO_MAXIMO_BUSQUEDA = 60;

// Sin tildes y en minúscula: "Etiopía" y "etiopia" tienen que coincidir
const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// "Brasil y Colombia" (el blend) → ["Brasil", "Colombia"]
const paisesDe = (origen) => (origen ? origen.split(/,| y /).map((pais) => pais.trim()) : []);

// Países de origen de los cafés, sin repetir y en orden alfabético (salen de los datos:
// si el admin carga un café de un país nuevo, aparece solo en el filtro)
export function paisesDeOrigen(productos) {
  const paises = productos.filter((producto) => producto.categoria === "cafe").flatMap((cafe) => paisesDe(cafe.origen));
  return [...new Set(paises)].sort((a, b) => a.localeCompare(b, "es"));
}

// Pasa los searchParams de Next ({ perfil: ["frutal", "intenso"], q: "choco" }) a URLSearchParams,
// el mismo formato que recibe la API
export function aParametros(searchParams) {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(searchParams ?? {})) {
    for (const uno of [valor].flat()) parametros.append(clave, uno);
  }
  return parametros;
}

// Lee y valida los filtros. Devuelve { filtros, errores }: en filtros quedan solo los valores válidos
// y en errores un mensaje por campo con problemas (la API responde 400; la página los muestra y sigue).
export function leerFiltros(parametros, { paises }) {
  const errores = {};

  // Lista de valores permitidos: los que no están en la lista son un error
  function lista(clave, permitidos, nombre) {
    const valores = [...new Set(parametros.getAll(clave).filter(Boolean))];
    const invalidos = valores.filter((valor) => !permitidos.includes(valor));
    if (invalidos.length > 0) errores[clave] = `${nombre} no válido: ${invalidos.join(", ")}.`;
    return valores.filter((valor) => permitidos.includes(valor));
  }

  // Precio: entero, sin signo; vacío = sin límite
  function precio(clave, nombre) {
    const valor = (parametros.get(clave) ?? "").trim();
    if (valor === "") return null;
    if (!/^\d{1,9}$/.test(valor)) {
      errores[clave] = `El precio ${nombre} tiene que ser un número entero, sin puntos ni signos.`;
      return null;
    }
    return Number(valor);
  }

  let q = (parametros.get("q") ?? "").trim();
  if (q.length > LARGO_MAXIMO_BUSQUEDA) {
    errores.q = `La búsqueda puede tener hasta ${LARGO_MAXIMO_BUSQUEDA} caracteres.`;
    q = "";
  }

  const idsNiveles = NIVELES.map((nivel) => nivel.id);
  const filtros = {
    q,
    perfil: lista("perfil", PERFILES.map((perfil) => perfil.id), "Perfil"),
    tostado: lista("tostado", TOSTADOS, "Tostado"),
    acidez: lista("acidez", idsNiveles, "Nivel de acidez"),
    cuerpo: lista("cuerpo", idsNiveles, "Nivel de cuerpo"),
    origen: lista("origen", paises, "Origen"),
    peso: lista("peso", PESOS.map(String), "Peso").map(Number),
    precioMin: precio("precioMin", "mínimo"),
    precioMax: precio("precioMax", "máximo"),
    conStock: parametros.get("stock") === "1",
  };

  if (filtros.precioMin !== null && filtros.precioMax !== null && filtros.precioMin > filtros.precioMax) {
    errores.precioMax = "El precio máximo tiene que ser mayor que el mínimo.";
    filtros.precioMax = null;
  }

  return { filtros, errores };
}

// Filtros que solo tienen sentido para cafés: si hay alguno, los accesorios no se muestran
export function hayFiltrosDeCafe(filtros) {
  return ["perfil", "tostado", "acidez", "cuerpo", "origen", "peso"].some((clave) => filtros[clave].length > 0);
}

export function hayFiltros(filtros) {
  return hayFiltrosDeCafe(filtros) || filtros.q !== "" || filtros.precioMin !== null || filtros.precioMax !== null || filtros.conStock;
}

const enNiveles = (valor, niveles) =>
  niveles.length === 0 || NIVELES.some((nivel) => niveles.includes(nivel.id) && valor >= nivel.min && valor <= nivel.max);

// Devuelve los productos que cumplen todos los filtros. Cada producto vuelve solo con las variantes
// que cumplen peso, precio y stock: así la tarjeta muestra el precio de lo que buscaste.
export function filtrarProductos(productos, filtros) {
  const busqueda = normalizar(filtros.q);
  const soloCafes = hayFiltrosDeCafe(filtros);

  return productos.flatMap((producto) => {
    const esCafe = producto.categoria === "cafe";
    if (soloCafes && !esCafe) return [];

    if (busqueda) {
      // Cafés: nombre, origen y notas. Accesorios: nombre y descripción corta.
      const campos = esCafe
        ? [producto.nombre, producto.origen, ...(producto.notas ?? [])]
        : [producto.nombre, producto.descripcion_corta];
      if (!normalizar(campos.join(" ")).includes(busqueda)) return [];
    }

    if (esCafe) {
      if (filtros.perfil.length > 0 && !filtros.perfil.includes(producto.perfil)) return [];
      if (filtros.tostado.length > 0 && !filtros.tostado.includes(producto.tostado)) return [];
      if (!enNiveles(producto.acidez, filtros.acidez) || !enNiveles(producto.cuerpo, filtros.cuerpo)) return [];
      if (filtros.origen.length > 0 && !paisesDe(producto.origen).some((pais) => filtros.origen.includes(pais))) return [];
    }

    const variantes = producto.variantes.filter(
      (variante) =>
        (filtros.peso.length === 0 || filtros.peso.includes(variante.peso_gramos)) &&
        (filtros.precioMin === null || variante.precio >= filtros.precioMin) &&
        (filtros.precioMax === null || variante.precio <= filtros.precioMax) &&
        (!filtros.conStock || variante.stock > 0),
    );
    return variantes.length > 0 ? [{ ...producto, variantes }] : [];
  });
}
