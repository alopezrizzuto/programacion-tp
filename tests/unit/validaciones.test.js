// Validaciones compartidas entre el navegador y el servidor: cuenta, checkout y contacto.
import { test } from "node:test";
import assert from "node:assert/strict";
import { destinoSeguro, normalizar, validarIngreso, validarRegistro } from "../../lib/auth.js";
import { normalizarCheckout, validarCheckout } from "../../lib/validacion-checkout.js";
import { normalizarContacto, validarContacto } from "../../lib/validacion-contacto.js";

test("registro válido (el email se pasa a minúsculas y sin espacios)", () => {
  const datos = normalizar({ nombre: " Ana ", email: " Ana@Mail.COM ", password: "cafe1234", confirmacion: "cafe1234" });
  assert.equal(datos.email, "ana@mail.com");
  assert.deepEqual(validarRegistro(datos), {});
});

test("registro: nombre corto, email mal escrito, contraseña débil y que no coincide", () => {
  const errores = validarRegistro(normalizar({ nombre: "A", email: "ana@mail", password: "cafecafe", confirmacion: "otra" }));
  assert.deepEqual(Object.keys(errores), ["nombre", "email", "password", "confirmacion"]);
  assert.match(errores.password, /una letra y un número/);
  assert.match(validarRegistro(normalizar({ nombre: "Ana", email: "a@b.co", password: "c1" })).password, /al menos 8/);
});

test("ingreso: email y contraseña obligatorios", () => {
  assert.deepEqual(Object.keys(validarIngreso(normalizar({}))), ["email", "password"]);
});

test("después de ingresar solo se vuelve a una ruta de la tienda", () => {
  assert.equal(destinoSeguro("/checkout"), "/checkout");
  assert.equal(destinoSeguro("//sitio-falso.com"), "/cuenta");
  assert.equal(destinoSeguro("/\\sitio-falso.com"), "/cuenta");
  assert.equal(destinoSeguro("https://sitio-falso.com"), "/cuenta");
  assert.equal(destinoSeguro(undefined), "/cuenta");
});

const CHECKOUT = {
  email: "ana@mail.com",
  nombre: "Ana Pérez",
  telefono: "11 4567-8901",
  direccion: "Av. Corrientes 1234",
  ciudad: "CABA",
  provincia: "Ciudad Autónoma de Buenos Aires",
  codigoPostal: "c1414aab",
  medioPago: "transferencia",
};

test("checkout válido, con código postal nuevo en minúsculas", () => {
  const datos = normalizarCheckout(CHECKOUT);
  assert.equal(datos.codigoPostal, "C1414AAB");
  assert.deepEqual(validarCheckout(datos), {});
  assert.deepEqual(validarCheckout(normalizarCheckout({ ...CHECKOUT, codigoPostal: "1414", telefono: "+54 9 11 4567 8901" })), {});
});

test("checkout: cada campo inválido tiene su mensaje", () => {
  const errores = validarCheckout(
    normalizarCheckout({ email: "ana", nombre: "A", telefono: "123", direccion: "x", ciudad: "", provincia: "Narnia", codigoPostal: "14", medioPago: "efectivo" }),
  );
  assert.deepEqual(Object.keys(errores), ["email", "nombre", "telefono", "direccion", "ciudad", "provincia", "codigoPostal", "medioPago"]);
});

test("checkout: el teléfono no acepta letras", () => {
  assert.ok(validarCheckout(normalizarCheckout({ ...CHECKOUT, telefono: "11 CAFE 8901" })).telefono);
});

test("contacto válido y con mensaje muy corto o muy largo", () => {
  const base = { nombre: "Ana", email: "ana@mail.com", motivo: "envios", mensaje: "¿Llegan a Córdoba en 48 h?" };
  assert.deepEqual(validarContacto(normalizarContacto(base)), {});
  assert.ok(validarContacto(normalizarContacto({ ...base, mensaje: "Hola" })).mensaje);
  assert.ok(validarContacto(normalizarContacto({ ...base, mensaje: "a".repeat(2001) })).mensaje);
  assert.ok(validarContacto(normalizarContacto({ ...base, motivo: "spam" })).motivo);
});
