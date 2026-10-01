// Configuración comercial de la tienda: si cambia una promo, se cambia acá.
export const PROMOS = {
  descuentoTransferencia: 10, // % OFF pagando por transferencia
  cuotasSinInteres: 6,
  envioGratisDesde: 100000, // en pesos
  descuentoCantidad: { desdeUnidades: 2, porcentaje: 5 },
};

export const ENVIOS = [
  { zona: "CABA y GBA", plazo: "24 a 48 h hábiles" },
  { zona: "Resto del país", plazo: "3 a 5 días hábiles" },
];

// Por debajo de este stock se muestra el aviso "¡Quedan pocas!"
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
