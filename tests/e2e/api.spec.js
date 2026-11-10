// API interna (Route Handlers) y webhook de Mercado Pago, sin pasar por la interfaz.
import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";
import { SECRETO_WEBHOOK_E2E, baseDePrueba, emailDePrueba } from "./ayudantes.js";

const ENVIO = {
  nombre: "Prueba Automática",
  telefono: "11 4567-8901",
  direccion: "Av. Corrientes 1234",
  ciudad: "CABA",
  provincia: "Ciudad Autónoma de Buenos Aires",
  codigoPostal: "1414",
  medioPago: "transferencia",
};

test.describe("GET /api/productos", () => {
  test("filtra igual que la página", async ({ request }) => {
    const respuesta = await request.get("/api/productos?perfil=frutal&peso=250");
    expect(respuesta.ok()).toBe(true);
    const { total, productos } = await respuesta.json();
    expect(total).toBe(2);
    expect(productos.map((p) => p.slug).sort()).toEqual(["etiopia-yirgacheffe", "kenia-aa"]);
    expect(productos.every((p) => p.variantes.every((v) => v.peso_gramos === 250))).toBe(true);
  });

  test("un filtro inválido da 400 con el error del campo", async ({ request }) => {
    const respuesta = await request.get("/api/productos?perfil=dulce&precioMin=abc");
    expect(respuesta.status()).toBe(400);
    expect(Object.keys((await respuesta.json()).errores).sort()).toEqual(["perfil", "precioMin"]);
  });
});

test.describe("POST /api/recomendacion", () => {
  test("devuelve 3 cafés con stock, con coincidencia y molienda", async ({ request }) => {
    const respuesta = await request.post("/api/recomendacion", {
      data: { intensidad: "suave", acidez: "mucho", leche: "solo", metodo: "filtro" },
    });
    const { resultados } = await respuesta.json();
    expect(resultados).toHaveLength(3);
    expect(["Etiopía Yirgacheffe", "Kenia AA"]).toContain(resultados[0].cafe.nombre);
    expect(resultados[0]).toMatchObject({ molienda: "media", coincidencia: expect.any(Number) });
    expect(resultados[0].cafe.resenas).toBeUndefined();
  });

  test("respuestas incompletas o inventadas dan 400", async ({ request }) => {
    expect((await request.post("/api/recomendacion", { data: { intensidad: "suave" } })).status()).toBe(400);
    // Un cuerpo que no es JSON se rechaza antes de mirar las respuestas (auditoría de seguridad)
    const noJson = await request.post("/api/recomendacion", { data: "no es json", headers: { "content-type": "text/plain" } });
    expect(noJson.status()).toBe(415);
  });
});

test.describe("POST /api/ordenes", () => {
  test("el total lo calcula el servidor: un precio mandado desde el navegador se ignora", async ({ request }) => {
    const respuesta = await request.post("/api/ordenes", {
      data: { ...ENVIO, email: emailDePrueba("precio"), items: [{ varianteId: 601, molienda: "fina", cantidad: 1, precio: 1 }], total: 1 },
    });
    expect(respuesta.status()).toBe(201);
    const { codigo } = await respuesta.json();
    const { data: orden } = await baseDePrueba().from("ordenes").select("total, orden_items(precio_unitario)").eq("codigo", codigo).single();
    // Blend Espresso 250 g: $13.500 − 10% transferencia = $12.150, + envío $6.500
    expect(orden.total).toBe(18650);
    expect(orden.orden_items[0].precio_unitario).toBe(13500);
  });

  test("no deja pedir más bolsas que el stock", async ({ request }) => {
    const respuesta = await request.post("/api/ordenes", {
      data: { ...ENVIO, email: emailDePrueba("stock"), items: [{ varianteId: 203, molienda: "media", cantidad: 5 }] },
    });
    expect(respuesta.status()).toBe(409);
    expect((await respuesta.json()).error).toContain("quedan solo 4");
  });

  test("datos de envío inválidos dan 400 por campo", async ({ request }) => {
    const respuesta = await request.post("/api/ordenes", {
      data: { email: "no-es-email", medioPago: "efectivo", items: [{ varianteId: 101, molienda: "fina", cantidad: 1 }] },
    });
    expect(respuesta.status()).toBe(400);
    expect((await respuesta.json()).errores).toHaveProperty("email");
  });
});

test.describe("Webhook de Mercado Pago", () => {
  const URL = "/api/webhooks/mercadopago?type=payment&data.id=123456";

  const firmar = (idPago, idAviso, secreto = SECRETO_WEBHOOK_E2E) => {
    const ts = String(Math.floor(Date.now() / 1000));
    const v1 = createHmac("sha256", secreto).update(`id:${idPago};request-id:${idAviso};ts:${ts};`).digest("hex");
    return `ts=${ts},v1=${v1}`;
  };

  test("un aviso que no es de un pago se da por recibido (200)", async ({ request }) => {
    const respuesta = await request.post("/api/webhooks/mercadopago?type=merchant_order&data.id=1", { data: {} });
    expect(respuesta.status()).toBe(200);
  });

  test("sin firma: 401", async ({ request }) => {
    expect((await request.post(URL, { data: {} })).status()).toBe(401);
  });

  test("firmado con otra clave: 401", async ({ request }) => {
    const respuesta = await request.post(URL, {
      data: {},
      headers: { "x-signature": firmar("123456", "aviso-1", "clave-falsa"), "x-request-id": "aviso-1" },
    });
    expect(respuesta.status()).toBe(401);
  });

  test("firma de otro pago (alguien cambió el id): 401", async ({ request }) => {
    const respuesta = await request.post(URL, {
      data: {},
      headers: { "x-signature": firmar("999999", "aviso-1"), "x-request-id": "aviso-1" },
    });
    expect(respuesta.status()).toBe(401);
  });

  test("con la firma correcta pasa el control y va a consultar el pago a Mercado Pago", async ({ request }) => {
    // En los tests no hay token de Mercado Pago: la consulta falla y responde 502 ("reintentá"),
    // que es lo que haría si Mercado Pago no respondiera. Lo importante: no es 401.
    const respuesta = await request.post(URL, {
      data: {},
      headers: { "x-signature": firmar("123456", "aviso-1"), "x-request-id": "aviso-1" },
    });
    expect(respuesta.status()).toBe(502);
  });
});

// Arreglos de la auditoría de seguridad (fix/seguridad)
test.describe("Auditoría de seguridad", () => {
  test("login CSRF: un pedido desde otro sitio se rechaza (403) y no deja sesión", async ({ request }) => {
    const respuesta = await request.post("/api/auth/ingresar", {
      data: { email: "alguien@example.com", password: "cualquiera1" },
      headers: { origin: "https://sitio-falso.example" },
    });
    expect(respuesta.status()).toBe(403);
    expect(respuesta.headers()["set-cookie"]).toBeUndefined();
  });

  test("login CSRF: un formulario text/plain se rechaza (415)", async ({ request }) => {
    const respuesta = await request.post("/api/auth/ingresar", {
      data: '{"email":"alguien@example.com","password":"cualquiera1","x":"="}',
      headers: { "content-type": "text/plain" },
    });
    expect(respuesta.status()).toBe(415);
  });

  test("un cuerpo JSON null da 400 (antes hacía fallar la ruta con 500)", async ({ request }) => {
    for (const ruta of ["/api/contacto", "/api/ordenes", "/api/auth/registro"]) {
      const respuesta = await request.post(ruta, { data: "null", headers: { "content-type": "application/json" } });
      expect(respuesta.status(), ruta).toBe(400);
    }
  });

  test("un email armado para trabar el servidor se rechaza enseguida", async ({ request }) => {
    const inicio = Date.now();
    const respuesta = await request.post("/api/contacto", {
      data: { nombre: "Prueba", email: "a@" + ".".repeat(100000) + "@", motivo: "otro", mensaje: "Un mensaje de prueba." },
    });
    expect(respuesta.status()).toBe(400);
    expect(Date.now() - inicio).toBeLessThan(3000);
  });

  test("el checkout rechaza una ciudad de 1 MB", async ({ request }) => {
    const respuesta = await request.post("/api/ordenes", {
      data: { ...ENVIO, email: emailDePrueba("ciudad"), ciudad: "x".repeat(1_000_000), items: [{ varianteId: 601, molienda: "fina", cantidad: 1 }] },
    });
    expect(respuesta.status()).toBe(400);
    expect((await respuesta.json()).errores).toHaveProperty("ciudad");
  });

  test("las respuestas llevan los encabezados de seguridad", async ({ request }) => {
    const encabezados = (await request.get("/")).headers();
    expect(encabezados["x-frame-options"]).toBe("DENY");
    expect(encabezados["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(encabezados["x-content-type-options"]).toBe("nosniff");
    expect(encabezados["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("la página de seguimiento no se guarda en caché", async ({ request }) => {
    const pedido = await request.post("/api/ordenes", {
      data: { ...ENVIO, email: emailDePrueba("cache"), items: [{ varianteId: 601, molienda: "fina", cantidad: 1 }] },
    });
    const { codigo } = await pedido.json();
    const cache = (await request.get(`/seguimiento/${codigo}`)).headers()["cache-control"];
    expect(cache).toContain("no-store");
  });
});
