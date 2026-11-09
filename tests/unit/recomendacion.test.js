// Test "Elegí tu café ideal" (lib/recomendacion.js): validación y puntaje.
import { test } from "node:test";
import assert from "node:assert/strict";
import { recomendar, validarRespuestas } from "../../lib/recomendacion.js";
import { CAFES } from "./catalogo-de-prueba.js";

const COMPLETAS = { intensidad: "fuerte", acidez: "poco", leche: "con-leche", metodo: "espresso" };

test("respuestas completas y válidas", () => {
  assert.equal(validarRespuestas(COMPLETAS), null);
});

test("respuestas que no son un objeto", () => {
  for (const valor of [null, undefined, "fuerte", 3, []]) {
    assert.equal(validarRespuestas(valor), "Las respuestas no son válidas.", String(valor));
  }
});

test("falta una respuesta: dice cuál", () => {
  const { metodo: _metodo, ...sinMetodo } = COMPLETAS;
  assert.equal(validarRespuestas(sinMetodo), "Falta responder: ¿Cómo lo preparás?");
});

test("una respuesta que no es una de las opciones", () => {
  assert.match(validarRespuestas({ ...COMPLETAS, intensidad: "extra" }), /¿Cómo te gusta el café\?/);
  assert.match(validarRespuestas({ ...COMPLETAS, leche: 1 }), /¿Cómo lo tomás\?/);
});

test("fuerte, poco ácido, con leche y espresso: gana el intenso, molido fino", () => {
  const [primero] = recomendar(COMPLETAS, CAFES);
  assert.equal(primero.cafe.nombre, "Blend Espresso");
  assert.equal(primero.molienda, "fina");
  assert.ok(primero.motivos.includes("tiene cuerpo para bancarse la leche"));
});

test("suave, muy ácido, solo y filtro: gana el frutal, molienda media", () => {
  const [primero] = recomendar({ intensidad: "suave", acidez: "mucho", leche: "solo", metodo: "filtro" }, CAFES);
  assert.equal(primero.cafe.nombre, "Etiopía Yirgacheffe");
  assert.equal(primero.molienda, "media");
});

test("devuelve como mucho 3, de mayor a menor coincidencia, entre 0 y 100%", () => {
  const resultados = recomendar({ intensidad: "medio", acidez: "algo", leche: "solo", metodo: "propio" }, CAFES);
  assert.equal(resultados.length, 3);
  for (let i = 1; i < resultados.length; i++) assert.ok(resultados[i - 1].puntaje >= resultados[i].puntaje);
  assert.ok(resultados.every((r) => r.coincidencia >= 0 && r.coincidencia <= 100));
  assert.equal(resultados[0].molienda, "grano entero");
});
