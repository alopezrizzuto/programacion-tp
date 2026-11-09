// Carrito en el navegador: agregar, bundles, upsell y que sobreviva a recargar la página.
import { test, expect } from "@playwright/test";
import { agregarCafe } from "./ayudantes.js";

test("agregar un café con su molienda actualiza el contador del header", async ({ page }) => {
  const panel = await agregarCafe(page, "etiopia-yirgacheffe", { molienda: "gruesa" });
  await expect(panel).toContainText("Etiopía Yirgacheffe");
  await expect(panel).toContainText("gruesa");
  await expect(page.getByRole("button", { name: "Abrir carrito, 1 producto" })).toBeVisible();
});

test("el bundle de 2 bolsas aplica 10% OFF y el total suma el envío", async ({ page }) => {
  const panel = await agregarCafe(page, "etiopia-yirgacheffe", { bolsas: 2 });
  // 2 × $19.500 = $39.000, −10% = $35.100, + envío $6.500 = $41.600
  await expect(panel).toContainText("−10% por llevar varias bolsas");
  await expect(panel.locator("div", { has: page.getByText("Total", { exact: true }) }).last()).toContainText("41.600");
});

test("el carrito se guarda en el navegador: sigue ahí después de recargar", async ({ page }) => {
  await agregarCafe(page, "colombia-huila");
  await page.reload();
  await page.getByRole("button", { name: /Abrir carrito, 1 producto/ }).click();
  await expect(page.getByRole("dialog", { name: /Tu carrito/ })).toContainText("Colombia Huila");
  // En el navegador se guardan solo ids, molienda y cantidad: nunca precios
  const guardado = await page.evaluate(() => localStorage.getItem("origen-cafe-carrito"));
  expect(guardado).not.toContain("precio");
});

test("el upsell agrega un accesorio y se puede quitar una línea", async ({ page }) => {
  const panel = await agregarCafe(page, "guatemala-antigua");
  const sugerencias = panel.getByRole("button", { name: /Completá tu pedido/ });
  if ((await sugerencias.getAttribute("aria-expanded")) === "false") await sugerencias.click();
  await panel.getByRole("button", { name: "Agregar Vasos de doble vidrio al carrito" }).click();
  await expect(page.getByRole("button", { name: "Abrir carrito, 2 productos" })).toBeAttached();

  await panel.getByRole("button", { name: "Quitar" }).first().click();
  await expect(page.getByRole("button", { name: "Abrir carrito, 1 producto" })).toBeAttached();
});
