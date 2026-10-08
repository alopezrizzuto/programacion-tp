// "Almacén" del carrito en el navegador: guarda los ítems en localStorage y avisa
// a quien esté escuchando cuando cambian. React lo lee con useSyncExternalStore.
// Cada ítem: { varianteId, molienda, cantidad }. No guarda precios.

import { buscarVariante, claveLinea } from "./carrito";

const CLAVE = "origen-cafe-carrito";
const VACIO = [];
let items = null; // se lee de localStorage la primera vez que se pide
const oyentes = new Set();

function leer() {
  if (items === null) {
    try {
      items = JSON.parse(localStorage.getItem(CLAVE)) ?? [];
    } catch {
      items = []; // localStorage bloqueado o dato roto: arrancamos con el carrito vacío
    }
  }
  return items;
}

function guardar(nuevos) {
  items = nuevos;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    // Si no se puede guardar, el carrito igual funciona mientras la pestaña esté abierta
  }
  oyentes.forEach((avisar) => avisar());
}

// No se puede tener más unidades que el stock de la variante
function limitarAlStock(varianteId, cantidad) {
  const encontrado = buscarVariante(varianteId);
  return encontrado ? Math.min(cantidad, encontrado.variante.stock) : 0;
}

export function suscribir(avisar) {
  oyentes.add(avisar);
  // Si el carrito cambia en otra pestaña, esta también se actualiza
  function alCambiarEnOtraPestana(evento) {
    if (evento.key === CLAVE) {
      items = null;
      avisar();
    }
  }
  window.addEventListener("storage", alCambiarEnOtraPestana);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", alCambiarEnOtraPestana);
  };
}

export const obtenerItems = leer;
export const obtenerItemsEnServidor = () => VACIO;

export function agregarItem({ varianteId, molienda = null, cantidad = 1 }) {
  const actuales = leer();
  const clave = claveLinea(varianteId, molienda);
  const existente = actuales.find((item) => claveLinea(item.varianteId, item.molienda) === clave);
  // Las otras moliendas de la misma variante también ocupan stock
  const enOtrasLineas = actuales
    .filter((item) => item.varianteId === varianteId && item !== existente)
    .reduce((suma, item) => suma + item.cantidad, 0);
  const nuevaCantidad = limitarAlStock(varianteId, (existente?.cantidad ?? 0) + cantidad + enOtrasLineas) - enOtrasLineas;
  if (nuevaCantidad <= 0) return;

  guardar(
    existente
      ? actuales.map((item) => (item === existente ? { ...item, cantidad: nuevaCantidad } : item))
      : [...actuales, { varianteId, molienda, cantidad: nuevaCantidad }]
  );
}

export function cambiarCantidad(clave, cantidad) {
  const actuales = leer();
  if (cantidad <= 0) return quitarItem(clave);
  const linea = actuales.find((item) => claveLinea(item.varianteId, item.molienda) === clave);
  if (!linea) return;
  const enOtrasLineas = actuales
    .filter((item) => item.varianteId === linea.varianteId && item !== linea)
    .reduce((suma, item) => suma + item.cantidad, 0);
  const permitida = limitarAlStock(linea.varianteId, cantidad + enOtrasLineas) - enOtrasLineas;
  guardar(actuales.map((item) => (item === linea ? { ...item, cantidad: Math.max(1, permitida) } : item)));
}

export function quitarItem(clave) {
  guardar(leer().filter((item) => claveLinea(item.varianteId, item.molienda) !== clave));
}
