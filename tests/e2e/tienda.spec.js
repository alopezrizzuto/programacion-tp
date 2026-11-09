// Recorrido de la tienda: portada, catálogo con filtros y página de producto.
import { test, expect } from "@playwright/test";

test("la portada presenta la tienda y lleva al catálogo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Café de especialidad, del grano a tu taza");
  await page.getByRole("link", { name: "Comprar café" }).click();
  await expect(page).toHaveURL("/productos");
  await expect(page.getByRole("status").filter({ hasText: "Todos nuestros productos" })).toBeVisible();
});

test("filtrar por perfil deja los filtros en la URL y muestra solo esos cafés", async ({ page }) => {
  await page.goto("/productos");
  await page.getByRole("group", { name: "Perfil" }).locator("label", { hasText: /^Frutales$/ }).click();
  await expect(page).toHaveURL(/perfil=frutal/);
  await expect(page.getByRole("status").filter({ hasText: "Encontramos" })).toContainText("2 cafés");
  const resultados = page.getByRole("main");
  await expect(resultados.getByRole("link", { name: /Kenia AA/ }).first()).toBeVisible();
  await expect(resultados.getByRole("link", { name: /Blend Espresso/ })).toHaveCount(0);

  // El link con los filtros se puede compartir: al abrirlo de nuevo, la casilla sigue tildada
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Frutales" })).toBeChecked();
});

test("buscar sin resultados ofrece salidas", async ({ page }) => {
  await page.goto("/productos?q=zzzz");
  await expect(page.getByText("No encontramos productos con esos filtros.")).toBeVisible();
  await page.getByRole("link", { name: "Ver todos los productos" }).click();
  await expect(page).toHaveURL("/productos");
});

test("un filtro inválido en la URL avisa y la página sigue funcionando", async ({ page }) => {
  await page.goto("/productos?perfil=dulce");
  await expect(page.locator('ul[role="alert"]')).toContainText("Perfil no válido: dulce.");
  await expect(page.getByRole("status").filter({ hasText: "Todos nuestros productos" })).toBeVisible();
});

test("la página de un café muestra el peso sin stock deshabilitado", async ({ page }) => {
  await page.goto("/cafes/kenia-aa");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kenia AA");
  await expect(page.getByRole("radio", { name: /500 g/ })).toBeDisabled();
  await expect(page.getByRole("radio", { name: /250 g/ })).toBeChecked();
});

test("un producto que no existe da 404", async ({ page }) => {
  const respuesta = await page.goto("/cafes/no-existe");
  expect(respuesta.status()).toBe(404);
});

test("en el celular no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const ruta of ["/", "/productos", "/cafes/colombia-huila", "/checkout"]) {
    await page.goto(ruta);
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(sobra, ruta).toBeLessThanOrEqual(0);
  }
});
