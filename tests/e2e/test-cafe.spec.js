// Test "Elegí tu café ideal" de la portada (formulario + POST /api/recomendacion).
import { test, expect } from "@playwright/test";

test("con las 4 respuestas recomienda un café y lo agrega con la molienda sugerida", async ({ page }) => {
  await page.goto("/#elegi");
  const seccion = page.locator("#elegi");
  for (const opcion of ["Fuerte", "Poco", "Con leche", "Cafetera espresso"]) {
    await seccion.getByText(opcion, { exact: true }).click();
  }
  const pedido = page.waitForRequest("**/api/recomendacion");
  await seccion.getByRole("button", { name: "Ver mi café" }).click();
  expect((await pedido).postDataJSON()).toEqual({ intensidad: "fuerte", acidez: "poco", leche: "con-leche", metodo: "espresso" });

  await expect(seccion.getByRole("heading", { name: "Tu café ideal" })).toBeVisible();
  const recomendado = seccion.locator("article").first();
  await expect(recomendado).toContainText(/Brasil Cerrado|Blend Espresso/);
  await expect(recomendado).toContainText("Molienda sugerida: fina");

  await recomendado.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByRole("dialog", { name: /Tu carrito/ })).toBeVisible();
  const carrito = await page.evaluate(() => JSON.parse(localStorage.getItem("origen-cafe-carrito")));
  expect(carrito).toEqual([expect.objectContaining({ molienda: "fina", cantidad: 1 })]);
});

test("confirmar sin responder todo avisa qué falta y no consulta al servidor", async ({ page }) => {
  let consultas = 0;
  page.on("request", (pedido) => pedido.url().includes("/api/recomendacion") && consultas++);
  await page.goto("/#elegi");
  const seccion = page.locator("#elegi");
  await seccion.getByText("Suave", { exact: true }).click();
  // Ir directo a la última pregunta y confirmar
  await seccion.getByRole("button", { name: /Método/ }).click();
  await seccion.getByRole("button", { name: "Ver mi café" }).click();
  await expect(seccion.getByRole("alert")).toContainText("Falta responder: ¿Te gusta que sea ácido? ¿Cómo lo tomás? ¿Cómo lo preparás?");
  expect(consultas).toBe(0);
});
