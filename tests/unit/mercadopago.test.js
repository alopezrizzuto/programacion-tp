// Webhook de Mercado Pago (lib/mercadopago.js): la firma y qué se hace con cada pago.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { decidirPago, firmaValida } from "../../lib/mercadopago.js";

const SECRETO = "secreto-de-prueba";

// Firma como lo hace Mercado Pago: HMAC-SHA256 de "id:...;request-id:...;ts:...;"
function firmar({ idPago, idAviso, ts = "1730000000", secreto = SECRETO }) {
  const v1 = createHmac("sha256", secreto).update(`id:${idPago};request-id:${idAviso};ts:${ts};`).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

test("firma correcta", () => {
  const firma = firmar({ idPago: "123", idAviso: "aviso-1" });
  assert.equal(firmaValida({ firma, idAviso: "aviso-1", idPago: "123", secreto: SECRETO }), true);
});

test("firma de otro pago (alguien cambió el id del aviso)", () => {
  const firma = firmar({ idPago: "123", idAviso: "aviso-1" });
  assert.equal(firmaValida({ firma, idAviso: "aviso-1", idPago: "999", secreto: SECRETO }), false);
});

test("firma hecha con otra clave", () => {
  const firma = firmar({ idPago: "123", idAviso: "aviso-1", secreto: "otra-clave" });
  assert.equal(firmaValida({ firma, idAviso: "aviso-1", idPago: "123", secreto: SECRETO }), false);
});

test("sin firma, firma mal armada o sin clave configurada", () => {
  const base = { idAviso: "aviso-1", idPago: "123", secreto: SECRETO };
  assert.equal(firmaValida({ ...base, firma: null }), false);
  assert.equal(firmaValida({ ...base, firma: "cualquier-cosa" }), false);
  assert.equal(firmaValida({ ...base, firma: "ts=1730000000" }), false);
  assert.equal(firmaValida({ ...base, firma: "ts=1730000000,v1=abc" }), false);
  assert.equal(firmaValida({ ...base, firma: firmar({ idPago: "123", idAviso: "aviso-1" }), secreto: undefined }), false);
});

test("el id del pago se compara en minúsculas, como lo firma Mercado Pago", () => {
  const firma = firmar({ idPago: "abc123", idAviso: "aviso-1" });
  assert.equal(firmaValida({ firma, idAviso: "aviso-1", idPago: "ABC123", secreto: SECRETO }), true);
});

const ORDEN = { id: 7, estado: "pendiente", total: 26500 };

test("pago aprobado por el monto exacto: se confirma", () => {
  assert.equal(decidirPago({ status: "approved", transaction_amount: 26500 }, ORDEN).accion, "confirmar");
});

test("pago aprobado por otro monto: no se confirma", () => {
  const decision = decidirPago({ status: "approved", transaction_amount: 100 }, ORDEN);
  assert.equal(decision.accion, "ignorar");
  assert.match(decision.motivo, /cobró 100/);
});

test("pago rechazado o cancelado: se rechaza el pedido", () => {
  assert.equal(decidirPago({ status: "rejected", transaction_amount: 26500 }, ORDEN).accion, "rechazar");
  assert.equal(decidirPago({ status: "cancelled", transaction_amount: 26500 }, ORDEN).accion, "rechazar");
});

test("pago pendiente o en proceso: el pedido sigue esperando", () => {
  assert.equal(decidirPago({ status: "pending", transaction_amount: 26500 }, ORDEN).accion, "ignorar");
  assert.equal(decidirPago({ status: "in_process", transaction_amount: 26500 }, ORDEN).accion, "ignorar");
});

test("pago que no es de un pedido nuestro", () => {
  assert.equal(decidirPago({ status: "approved", transaction_amount: 26500 }, null).accion, "ignorar");
  assert.equal(decidirPago(null, ORDEN).accion, "ignorar");
});
