// Armado de la orden en el servidor (lib/ordenes.js): nunca confía en lo que manda el navegador.
import { test } from "node:test";
import assert from "node:assert/strict";
import { armarOrden, FORMATO_CODIGO, generarCodigo } from "../../lib/ordenes.js";
import { PRODUCTOS } from "./catalogo-de-prueba.js";

test("el precio sale del catálogo, no del navegador", () => {
  const orden = armarOrden([{ varianteId: 11, cantidad: 1, molienda: "fina", precio: 1 }], PRODUCTOS, "mercadopago");
  assert.equal(orden.lineas[0].precio_unitario, 20000);
  assert.equal(orden.total, 20000 + 6500);
  assert.equal(orden.lineas[0].descripcion, "Etiopía Yirgacheffe, 250 g");
});

test("transferencia: 10% OFF en los productos, no en el envío", () => {
  const orden = armarOrden([{ varianteId: 11, cantidad: 2, molienda: "fina" }], PRODUCTOS, "transferencia");
  // 2 bolsas: $40.000 − 10% bundle = $36.000; − 10% transferencia = $32.400; + envío
  assert.equal(orden.subtotal, 40000);
  assert.equal(orden.descuento_bundles, 4000);
  assert.equal(orden.descuento_transferencia, 3600);
  assert.equal(orden.costo_envio, 6500);
  assert.equal(orden.total, 32400 + 6500);
});

test("carrito vacío o que no es una lista", () => {
  assert.equal(armarOrden([], PRODUCTOS, "transferencia").error, "Tu carrito está vacío.");
  assert.equal(armarOrden("hola", PRODUCTOS, "transferencia").error, "Tu carrito está vacío.");
});

test("cantidades inválidas: 0, más de 99, con decimales o texto", () => {
  for (const cantidad of [0, 100, 1.5, "dos", -1]) {
    const { error } = armarOrden([{ varianteId: 11, cantidad, molienda: "fina" }], PRODUCTOS, "transferencia");
    assert.match(error, /datos inválidos/, `cantidad ${cantidad}`);
  }
});

test("una variante que no existe", () => {
  const { error } = armarOrden([{ varianteId: 999, cantidad: 1, molienda: "fina" }], PRODUCTOS, "transferencia");
  assert.match(error, /ya no está disponible/);
});

test("el café necesita una molienda de la lista; el accesorio la ignora", () => {
  assert.match(armarOrden([{ varianteId: 11, cantidad: 1 }], PRODUCTOS, "transferencia").error, /Elegí la molienda/);
  assert.match(armarOrden([{ varianteId: 11, cantidad: 1, molienda: "polvo" }], PRODUCTOS, "transferencia").error, /Elegí la molienda/);
  const accesorio = armarOrden([{ varianteId: 41, cantidad: 1, molienda: "fina" }], PRODUCTOS, "transferencia");
  assert.equal(accesorio.lineas[0].molienda, null);
});

test("stock: se suman las moliendas de la misma variante", () => {
  // Hay 3 bolsas de Guatemala: 2 finas + 2 gruesas son 4
  const { error } = armarOrden(
    [
      { varianteId: 21, cantidad: 2, molienda: "fina" },
      { varianteId: 21, cantidad: 2, molienda: "gruesa" },
    ],
    PRODUCTOS,
    "transferencia",
  );
  assert.match(error, /quedan solo 3/);
});

test("stock: una variante agotada", () => {
  const { error } = armarOrden([{ varianteId: 12, cantidad: 1, molienda: "fina" }], PRODUCTOS, "transferencia");
  assert.match(error, /se quedó sin stock/);
});

test("demasiadas líneas", () => {
  const items = Array.from({ length: 51 }, () => ({ varianteId: 41, cantidad: 1 }));
  assert.match(armarOrden(items, PRODUCTOS, "transferencia").error, /demasiadas líneas/);
});

test("el código de seguimiento tiene el formato OC- + 10 caracteres y no se repite", () => {
  const codigos = new Set(Array.from({ length: 1000 }, generarCodigo));
  assert.equal(codigos.size, 1000);
  for (const codigo of codigos) assert.match(codigo, FORMATO_CODIGO);
  // Sin letras que se confunden
  assert.ok([...codigos].every((codigo) => !/[O0I1]/.test(codigo.slice(3))));
});
