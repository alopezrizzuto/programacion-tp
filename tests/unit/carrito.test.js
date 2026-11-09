// Cálculo del carrito (lib/carrito.js): bundles, envío y transferencia.
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularCarrito } from "../../lib/carrito.js";
import { PRODUCTOS } from "./catalogo-de-prueba.js";

const linea = (varianteId, cantidad, molienda = "media") => ({ varianteId, cantidad, molienda });

test("una bolsa: precio de lista, envío de $6.500 y 10% OFF por transferencia solo en los productos", () => {
  const carrito = calcularCarrito([linea(11, 1)], PRODUCTOS);
  assert.equal(carrito.subtotal, 20000);
  assert.equal(carrito.total, 20000);
  assert.equal(carrito.costoEnvio, 6500);
  assert.equal(carrito.totalAPagar, 26500);
  assert.equal(carrito.totalTransferencia, 18000 + 6500);
  assert.equal(carrito.ahorroTransferencia, 2000);
});

test("bundle de 2 bolsas del mismo café y peso: 10% OFF, aunque tengan distinta molienda", () => {
  const carrito = calcularCarrito([linea(11, 1, "fina"), linea(11, 1, "gruesa")], PRODUCTOS);
  assert.equal(carrito.lineas.length, 2);
  assert.ok(carrito.lineas.every((l) => l.descuento === 10));
  assert.equal(carrito.subtotal, 40000);
  assert.equal(carrito.total, 36000);
  assert.equal(carrito.ahorroBundles, 4000);
});

test("bundle de 3 o más bolsas: 20% OFF (4 bolsas no suman más descuento)", () => {
  assert.equal(calcularCarrito([linea(11, 3)], PRODUCTOS).total, 48000);
  assert.equal(calcularCarrito([linea(11, 4)], PRODUCTOS).total, 64000);
});

test("el bundle es por café y peso: dos cafés distintos no se suman", () => {
  const carrito = calcularCarrito([linea(11, 1), linea(21, 1)], PRODUCTOS);
  assert.equal(carrito.ahorroBundles, 0);
  assert.equal(carrito.total, 45000);
});

test("los accesorios no tienen bundle", () => {
  const carrito = calcularCarrito([{ varianteId: 41, cantidad: 3, molienda: null }], PRODUCTOS);
  assert.equal(carrito.total, 90000);
  assert.equal(carrito.ahorroBundles, 0);
});

test("envío gratis desde $100.000 de productos (con los bundles ya aplicados)", () => {
  // 5 × $25.000 = $125.000, con 20% OFF = $100.000 justos
  const justo = calcularCarrito([linea(21, 5)], PRODUCTOS);
  assert.equal(justo.total, 100000);
  assert.equal(justo.envioGratis, true);
  assert.equal(justo.costoEnvio, 0);
  // $99.999 o menos paga envío: 1 bolsa de 1 kg ($70.000) + 1 de 250 g ($20.000) = $90.000
  const debajo = calcularCarrito([linea(31, 1), linea(11, 1)], PRODUCTOS);
  assert.equal(debajo.costoEnvio, 6500);
});

test("las líneas de productos que ya no existen se descartan; carrito vacío no paga envío", () => {
  const carrito = calcularCarrito([linea(999, 2)], PRODUCTOS);
  assert.equal(carrito.lineas.length, 0);
  assert.equal(carrito.costoEnvio, 0);
  assert.equal(carrito.totalAPagar, 0);
});
