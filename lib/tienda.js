// Configuración comercial de la tienda: si cambia una promo, se cambia acá.
export const PROMOS = {
  descuentoTransferencia: 10, // % OFF pagando por transferencia
  cuotasSinInteres: 6,
  envioGratisDesde: 100000, // en pesos
};

// Bundles de café: el descuento se aplica llevando varias bolsas del mismo café y peso.
// Son "atajos" de cantidad: elegir el de 2 bolsas es lo mismo que poner cantidad 2.
export const BUNDLES = [
  { unidades: 1, descuento: 0, etiqueta: null },
  { unidades: 2, descuento: 10, etiqueta: "Más vendida" },
  { unidades: 3, descuento: 20, etiqueta: "Mejor precio" },
];

// Plazos después del despacho (coinciden con el cálculo de lib/entrega.js: 1 a 4 días hábiles)
export const ENVIOS = [
  { zona: "CABA y GBA", plazo: "1 a 2 días hábiles" },
  { zona: "Resto del país", plazo: "2 a 4 días hábiles" },
];

// Prueba social y estadísticas de ejemplo (tienda de demostración: el footer lo aclara)
export const PRUEBA_SOCIAL = { clientes: "+10.000", recompra: "93%", despacho: "24 h" };

// Con este stock o menos se muestra el aviso de urgencia
export const STOCK_BAJO = 5;

const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(monto) {
  return formatoPesos.format(monto);
}

export function precioTransferencia(precio) {
  return Math.round(precio * (1 - PROMOS.descuentoTransferencia / 100));
}

export function valorCuota(precio) {
  return Math.round(precio / PROMOS.cuotasSinInteres);
}

// % de descuento según cuántas bolsas iguales se llevan (3 o más: el mejor bundle)
export function descuentoPorCantidad(cantidad) {
  const aplicable = BUNDLES.filter((bundle) => cantidad >= bundle.unidades);
  return aplicable[aplicable.length - 1].descuento;
}

// Total de una línea de café con el descuento del bundle aplicado
export function totalConBundle(precio, cantidad) {
  return Math.round(precio * cantidad * (1 - descuentoPorCantidad(cantidad) / 100));
}
