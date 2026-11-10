// Arreglos de la auditoría de seguridad (fix/seguridad): un test por cada pista.
import { test } from "node:test";
import assert from "node:assert/strict";
import { leerIdDeRuta, leerJson, origenAjeno, rechazarOrigenAjeno } from "../../lib/peticion.js";
import { emailValido, LARGO_MAXIMO_EMAIL } from "../../lib/email.js";
import { destinoSeguro } from "../../lib/auth.js";
import { normalizarCheckout, validarCheckout } from "../../lib/validacion-checkout.js";

const URL_API = "https://origen.cafe/api/auth/ingresar";
const pedido = (headers = {}, body = '{"email":"a@b.co"}') =>
  new Request(URL_API, { method: "POST", headers: { "content-type": "application/json", ...headers }, body });

// ---------- Login CSRF: mismo origen y solo JSON ----------

test("un pedido de nuestro propio sitio pasa", async () => {
  const { datos, respuesta } = await leerJson(pedido({ origin: "https://origen.cafe" }));
  assert.equal(respuesta, undefined);
  assert.deepEqual(datos, { email: "a@b.co" });
});

test("sin Origin (un test o curl) pasa, pero Sec-Fetch-Site cross-site no", async () => {
  assert.equal(origenAjeno(pedido()), false);
  assert.equal(origenAjeno(pedido({ "sec-fetch-site": "cross-site" })), true);
});

test("un pedido desde otro sitio se rechaza con 403", async () => {
  const { respuesta } = await leerJson(pedido({ origin: "https://sitio-falso.example" }));
  assert.equal(respuesta.status, 403);
  assert.equal(rechazarOrigenAjeno(pedido({ origin: "null" })).status, 403);
});

test("un formulario text/plain (el truco del login CSRF) se rechaza con 415", async () => {
  const { respuesta } = await leerJson(pedido({ "content-type": "text/plain" }, '{"email":"a@b.co","x":"="}'));
  assert.equal(respuesta.status, 415);
});

test("un cuerpo que no es un objeto da 400 (antes, null hacía fallar la ruta con 500)", async () => {
  for (const cuerpo of ["null", "[]", "3", "no es json"]) {
    const { respuesta } = await leerJson(pedido({}, cuerpo));
    assert.equal(respuesta.status, 400, cuerpo);
  }
});

test("los ids de la URL tienen que ser enteros positivos", async () => {
  assert.equal(await leerIdDeRuta(Promise.resolve({ id: "12" })), 12);
  for (const id of ["abc", "1.5", "0", "-3", ""]) assert.equal(await leerIdDeRuta(Promise.resolve({ id })), null, id);
});

// ---------- Redirección abierta ----------

test("destinoSeguro rechaza tabs, saltos de línea y barras invertidas que el navegador convierte en //", () => {
  for (const malicioso of ["/\t/sitio-falso.com", "/\n/sitio-falso.com", "/\r/sitio-falso.com", "/\t\\sitio-falso.com", "/%09/sitio-falso.com".replace("%09", "\t")]) {
    assert.equal(destinoSeguro(malicioso), "/cuenta", JSON.stringify(malicioso));
  }
});

test("destinoSeguro conserva las rutas internas con su query", () => {
  assert.equal(destinoSeguro("/checkout"), "/checkout");
  assert.equal(destinoSeguro("/admin/pedidos?filtro=pago"), "/admin/pedidos?filtro=pago");
  assert.equal(destinoSeguro("//sitio-falso.com"), "/cuenta");
});

// ---------- Regex de email ----------

test("emails válidos e inválidos", () => {
  for (const ok of ["ana@mail.com", "a.b+c@sub.dominio.com.ar", "x@y.co"]) assert.equal(emailValido(ok), true, ok);
  for (const mal of ["ana@mail", "ana@@mail.com", "ana @mail.com", "a@b.c", "a@b..co", ""]) assert.equal(emailValido(mal), false, mal);
});

test("un email armado para trabar el regex se rechaza al instante", () => {
  // Con el patrón viejo, "a@" + 50.000 puntos + "@" tardaba varios segundos
  const ataque = "a@" + ".".repeat(50000) + "@";
  const inicio = performance.now();
  assert.equal(emailValido(ataque), false);
  // Aunque no tuviera tope de largo, el patrón nuevo es lineal: también va rápido sin el tope
  const sinTope = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test("a@b" + ".b".repeat(50000) + "@");
  assert.equal(sinTope, false);
  assert.ok(performance.now() - inicio < 100, "tardó demasiado");
});

test("el email tiene un máximo de 254 caracteres", () => {
  const largo = "a".repeat(LARGO_MAXIMO_EMAIL - "@mail.com".length) + "@mail.com";
  assert.equal(emailValido(largo), true);
  assert.equal(emailValido("a" + largo), false);
});

// ---------- Checkout con máximos ----------

const CHECKOUT = {
  email: "ana@mail.com",
  nombre: "Ana Pérez",
  telefono: "11 4567-8901",
  direccion: "Av. Corrientes 1234",
  ciudad: "CABA",
  provincia: "Ciudad Autónoma de Buenos Aires",
  codigoPostal: "1414",
  medioPago: "transferencia",
};

test("checkout: ciudad de más de 80 caracteres, teléfono de más de 20 y email gigante se rechazan", () => {
  const errores = validarCheckout(
    normalizarCheckout({ ...CHECKOUT, ciudad: "x".repeat(81), telefono: "11" + "-".repeat(1000) + "45678901", email: "a".repeat(300) + "@mail.com" }),
  );
  assert.deepEqual(Object.keys(errores).sort(), ["ciudad", "email", "telefono"]);
});
