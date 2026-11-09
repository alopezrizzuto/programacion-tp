// Fecha de entrega (lib/entrega.js), en hora de Argentina (UTC−3).
// Las fechas se escriben en UTC: las 13:00 UTC son las 10:00 en Argentina.
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularEntrega } from "../../lib/entrega.js";

const dia = (fecha) => fecha.toISOString().slice(0, 10);

test("lunes antes de las 14: se despacha ese día y llega de martes a viernes", () => {
  const entrega = calcularEntrega(new Date("2026-11-09T13:00:00Z")); // lunes 10:00
  assert.equal(entrega.despachaHoy, true);
  assert.equal(entrega.minutosParaCorte, 240);
  assert.equal(dia(entrega.desde), "2026-11-10");
  assert.equal(dia(entrega.hasta), "2026-11-13");
});

test("lunes después de las 14: se despacha el martes", () => {
  const entrega = calcularEntrega(new Date("2026-11-09T18:00:00Z")); // lunes 15:00
  assert.equal(entrega.despachaHoy, false);
  assert.equal(entrega.minutosParaCorte, null);
  assert.equal(dia(entrega.despacho), "2026-11-10");
});

test("las 14:00 en punto ya no entran en el día", () => {
  assert.equal(calcularEntrega(new Date("2026-11-09T17:00:00Z")).despachaHoy, false);
});

test("viernes a la tarde: se despacha el lunes y saltea el fin de semana", () => {
  const entrega = calcularEntrega(new Date("2026-11-13T18:00:00Z")); // viernes 15:00
  assert.equal(dia(entrega.despacho), "2026-11-16");
  assert.equal(dia(entrega.desde), "2026-11-17");
  assert.equal(dia(entrega.hasta), "2026-11-20");
});

test("sábado a la mañana: también se despacha el lunes", () => {
  const entrega = calcularEntrega(new Date("2026-11-14T13:00:00Z")); // sábado 10:00
  assert.equal(entrega.despachaHoy, false);
  assert.equal(dia(entrega.despacho), "2026-11-16");
});

test("domingo a las 23 en Argentina (lunes 02:00 UTC): sigue siendo domingo para la tienda", () => {
  const entrega = calcularEntrega(new Date("2026-11-16T02:00:00Z"));
  assert.equal(entrega.despachaHoy, false);
  assert.equal(dia(entrega.despacho), "2026-11-16");
});
