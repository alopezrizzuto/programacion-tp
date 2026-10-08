// Cálculos del carrito. Son funciones puras (no tocan el navegador), así en E6
// el servidor puede usar las mismas para recalcular el total al crear la orden.
// El carrito guarda solo ids, cantidades y molienda: los precios salen siempre del catálogo
// (la lista de productos de Supabase), que se recibe como parámetro.

import { PROMOS, descuentoPorCantidad, precioTransferencia } from "./tienda";

// Busca a qué producto pertenece una variante (de café o de accesorio)
export function buscarVariante(productos, varianteId) {
  for (const producto of productos) {
    const variante = producto.variantes.find((v) => v.id === varianteId);
    if (variante) return { producto, variante };
  }
  return null;
}

// Cada línea se identifica por variante + molienda: el mismo café en dos moliendas son dos líneas
export function claveLinea(varianteId, molienda) {
  return `${varianteId}-${molienda ?? "sin-molienda"}`;
}

export function calcularCarrito(items, productos) {
  // Las líneas cuyo producto ya no existe se descartan
  const validos = items
    .map((item) => ({ ...item, ...buscarVariante(productos, item.varianteId) }))
    .filter((item) => item.producto);

  // Bundles: se cuentan las bolsas por café y peso, sumando todas las moliendas
  const bolsasPorVariante = {};
  for (const item of validos) {
    if (item.producto.categoria === "cafe") {
      bolsasPorVariante[item.varianteId] = (bolsasPorVariante[item.varianteId] ?? 0) + item.cantidad;
    }
  }

  const lineas = validos.map((item) => {
    const descuento = item.producto.categoria === "cafe" ? descuentoPorCantidad(bolsasPorVariante[item.varianteId]) : 0;
    const subtotal = item.variante.precio * item.cantidad;
    return {
      ...item,
      clave: claveLinea(item.varianteId, item.molienda),
      descuento,
      subtotal,
      total: Math.round(subtotal * (1 - descuento / 100)),
    };
  });

  const subtotal = lineas.reduce((suma, linea) => suma + linea.subtotal, 0);
  const total = lineas.reduce((suma, linea) => suma + linea.total, 0);

  return {
    lineas,
    unidades: lineas.reduce((suma, linea) => suma + linea.cantidad, 0),
    subtotal,
    ahorroBundles: subtotal - total,
    total,
    totalTransferencia: precioTransferencia(total),
    ahorroTransferencia: total - precioTransferencia(total),
    envioGratis: total >= PROMOS.envioGratisDesde,
  };
}
