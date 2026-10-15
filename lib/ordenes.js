// Lógica de los pedidos que no depende de la base ni del navegador (funciones puras).
// La usan la API (para armar la orden) y las páginas (para mostrar estados).

import { buscarVariante, calcularCarrito } from "./carrito";
import { MOLIENDAS } from "./productos";

// Cómo se muestra cada estado (coinciden con el CHECK de la base, migración 004)
export const ESTADOS = {
  pendiente: { nombre: "Esperando el pago", tono: "neutro" },
  pagada: { nombre: "Pago confirmado", tono: "bien" },
  enviada: { nombre: "En camino", tono: "bien" },
  entregada: { nombre: "Entregado", tono: "bien" },
  rechazada: { nombre: "Pago rechazado", tono: "mal" },
  cancelada: { nombre: "Cancelado", tono: "mal" },
};

// Los pasos que ve el cliente en el seguimiento, en orden
export const PASOS_SEGUIMIENTO = [
  { estado: "pendiente", nombre: "Pedido recibido" },
  { estado: "pagada", nombre: "Pago confirmado" },
  { estado: "enviada", nombre: "En camino" },
  { estado: "entregada", nombre: "Entregado" },
];

// Desde cada estado, a cuáles puede pasarlo el admin (el resto de los cambios no tiene sentido)
export const CAMBIOS_ADMIN = {
  pendiente: ["pagada", "cancelada"],
  rechazada: ["pagada", "cancelada"],
  pagada: ["enviada"],
  enviada: ["entregada"],
  entregada: [],
  cancelada: [],
};

// Código de seguimiento al azar, por ejemplo OC-7K2M9QXHPA. Sin letras que se confundan (O/0, I/1).
// 10 caracteres de 32 posibles: hay más de mil billones de códigos, no se pueden adivinar.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generarCodigo() {
  const azar = crypto.getRandomValues(new Uint32Array(10));
  return "OC-" + Array.from(azar, (numero) => ALFABETO[numero % ALFABETO.length]).join("");
}

export const FORMATO_CODIGO = /^OC-[A-Z0-9]{10}$/;

// Arma la orden a partir del carrito que manda el navegador y del catálogo de la base.
// Del navegador solo se usan qué variante, qué molienda y cuántas: los precios, los descuentos
// y el envío se calculan acá, con los mismos cálculos del carrito (lib/carrito.js).
// Devuelve { error } si algo no cierra, o los montos y las líneas listas para guardar.
export function armarOrden(itemsRecibidos, productos, medioPago) {
  if (!Array.isArray(itemsRecibidos) || itemsRecibidos.length === 0) return { error: "Tu carrito está vacío." };
  if (itemsRecibidos.length > 50) return { error: "El carrito tiene demasiadas líneas." };

  const items = [];
  for (const recibido of itemsRecibidos) {
    const varianteId = Number(recibido?.varianteId);
    const cantidad = Number(recibido?.cantidad);
    if (!Number.isInteger(varianteId) || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
      return { error: "El carrito tiene datos inválidos. Probá recargar la página." };
    }
    const encontrado = buscarVariante(productos, varianteId);
    if (!encontrado) return { error: "Algún producto de tu carrito ya no está disponible. Revisá el carrito." };

    // La molienda solo existe para los cafés, y tiene que ser una de las de la lista
    const esCafe = encontrado.producto.categoria === "cafe";
    const molienda = esCafe ? recibido.molienda : null;
    if (esCafe && !MOLIENDAS.some((opcion) => opcion.id === molienda)) {
      return { error: `Elegí la molienda de ${encontrado.producto.nombre}.` };
    }
    items.push({ varianteId, molienda, cantidad });
  }

  // Stock: se suman todas las moliendas de la misma variante (comparten las mismas bolsas)
  const porVariante = {};
  for (const item of items) porVariante[item.varianteId] = (porVariante[item.varianteId] ?? 0) + item.cantidad;
  for (const [varianteId, cantidad] of Object.entries(porVariante)) {
    const { producto, variante } = buscarVariante(productos, Number(varianteId));
    if (variante.stock < cantidad) {
      return {
        error:
          variante.stock === 0
            ? `${producto.nombre} (${variante.nombre}) se quedó sin stock. Sacalo del carrito para seguir.`
            : `De ${producto.nombre} (${variante.nombre}) quedan solo ${variante.stock}. Ajustá la cantidad en el carrito.`,
      };
    }
  }

  const carrito = calcularCarrito(items, productos);
  const descuentoTransferencia = medioPago === "transferencia" ? carrito.ahorroTransferencia : 0;

  return {
    lineas: carrito.lineas.map((linea) => ({
      variante_id: linea.varianteId,
      molienda: linea.molienda,
      cantidad: linea.cantidad,
      precio_unitario: linea.variante.precio,
      descripcion: `${linea.producto.nombre}, ${linea.variante.nombre}`,
    })),
    subtotal: carrito.subtotal,
    descuento_bundles: carrito.ahorroBundles,
    descuento_transferencia: descuentoTransferencia,
    costo_envio: carrito.costoEnvio,
    total: carrito.total - descuentoTransferencia + carrito.costoEnvio,
  };
}
