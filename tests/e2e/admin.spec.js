// Panel admin: quién entra, stock, alta y baja de productos y confirmación de pagos.
import { test, expect } from "@playwright/test";
import { ADMIN, CLIENTE, baseDePrueba, emailDePrueba, ingresar } from "./ayudantes.js";

const stockDe = async (varianteId) =>
  (await baseDePrueba().from("variantes").select("stock").eq("id", varianteId).single()).data.stock;

test("sin sesión, /admin lleva a ingresar", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/ingresar/);
});

test("un cliente no ve el panel (404) ni puede usar su API (403)", async ({ page }) => {
  await ingresar(page, CLIENTE);
  const respuesta = await page.goto("/admin");
  expect(respuesta.status()).toBe(404);

  const crear = await page.request.post("/api/productos", { data: { nombre: "Intruso" } });
  expect(crear.status()).toBe(403);
  const stock = await page.request.patch("/api/variantes/101", { data: { stock: 0 } });
  expect(stock.status()).toBe(403);
});

test("el admin cambia el stock desde la lista y queda guardado", async ({ page }) => {
  await ingresar(page, ADMIN, "/admin/productos");
  await page.locator("#stock-301").fill("19");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("#stock-301-estado")).toHaveText("Guardado");
  expect(await stockDe(301)).toBe(19);
});

test("el admin crea un café, aparece en la tienda y después lo borra", async ({ page }) => {
  await ingresar(page, ADMIN, "/admin");
  const slug = `e2e-cafe-${Date.now()}`;
  const crear = await page.request.post("/api/productos", {
    data: {
      categoria: "cafe",
      nombre: "Café de prueba E2E",
      slug,
      descripcion: "Un café que existe solo mientras corren los tests.",
      origen: "Perú",
      region: "Cajamarca",
      altura: "1.800 m",
      proceso: "Lavado",
      variedad: "Caturra",
      perfil: "equilibrado",
      tostado: "medio",
      acidez: 3,
      cuerpo: 3,
      notas: ["caramelo"],
      variantes: [{ peso_gramos: 250, precio: 15000, stock: 5 }],
    },
  });
  expect(crear.status()).toBe(201);
  const { id } = await crear.json();

  await page.goto(`/cafes/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Café de prueba E2E");

  const borrar = await page.request.delete(`/api/productos/${id}`);
  expect(borrar.ok()).toBe(true);
  expect((await page.goto(`/cafes/${slug}`)).status()).toBe(404);
});

test("crear un producto con datos inválidos devuelve el error de cada campo", async ({ page }) => {
  await ingresar(page, ADMIN, "/admin");
  const respuesta = await page.request.post("/api/productos", { data: { categoria: "cafe", nombre: "X", slug: "Con Espacios" } });
  expect(respuesta.status()).toBe(400);
  const { errores } = await respuesta.json();
  expect(Object.keys(errores)).toEqual(expect.arrayContaining(["nombre", "slug", "descripcion", "perfil", "variantes"]));
});

test("confirmar el pago de una transferencia descuenta el stock", async ({ page }) => {
  // Un pedido de 2 bolsas de Colombia Huila 250 g, por la API (como lo crea el checkout)
  const pedido = await page.request.post("/api/ordenes", {
    data: {
      email: emailDePrueba("admin-pago"),
      nombre: "Prueba Automática",
      telefono: "11 4567-8901",
      direccion: "Av. Corrientes 1234",
      ciudad: "CABA",
      provincia: "Ciudad Autónoma de Buenos Aires",
      codigoPostal: "1414",
      medioPago: "transferencia",
      items: [{ varianteId: 301, molienda: "media", cantidad: 2 }],
    },
  });
  expect(pedido.status()).toBe(201);
  const { codigo } = await pedido.json();
  const antes = await stockDe(301);

  await ingresar(page, ADMIN, "/admin/pedidos?filtro=pago");
  const tarjeta = page.getByRole("listitem").filter({ hasText: codigo });
  page.once("dialog", (dialogo) => dialogo.accept()); // "¿Confirmar que llegó el pago…?"
  await tarjeta.getByRole("button", { name: "Confirmar pago" }).click();
  await expect(tarjeta.getByRole("button", { name: "Confirmar pago" })).toHaveCount(0);

  expect(await stockDe(301)).toBe(antes - 2);
  const { data: orden } = await baseDePrueba().from("ordenes").select("estado").eq("codigo", codigo).single();
  expect(orden.estado).toBe("pagada");
});
