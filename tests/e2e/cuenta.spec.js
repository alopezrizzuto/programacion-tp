// Cuentas: registro, ingreso y "Mis pedidos".
import { test, expect } from "@playwright/test";
import { CLIENTE, agregarCafe, completarEnvio, emailDePrueba, ingresar } from "./ayudantes.js";

test("sin sesión, /cuenta lleva a ingresar", async ({ page }) => {
  await page.goto("/cuenta");
  await expect(page).toHaveURL(/\/ingresar\?siguiente=%2Fcuenta|\/ingresar\?siguiente=\/cuenta/);
});

test("registrarse crea la cuenta y entra directo", async ({ page }) => {
  await page.goto("/registro");
  await page.getByLabel("Nombre").fill("Lucía");
  await page.getByLabel("Email").fill(emailDePrueba("registro"));
  await page.getByLabel("Contraseña", { exact: true }).fill("cafe12345");
  await page.getByLabel("Repetí la contraseña").fill("cafe12345");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL("/cuenta");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hola, Lucía");
});

test("el registro valida antes de enviar y avisa si el email ya tiene cuenta", async ({ page }) => {
  await page.goto("/registro");
  await page.getByLabel("Nombre").fill("Lu");
  await page.getByLabel("Email").fill(CLIENTE.email);
  await page.getByLabel("Contraseña", { exact: true }).fill("sinnumeros");
  await page.getByLabel("Repetí la contraseña").fill("otra");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("La contraseña necesita al menos una letra y un número.")).toBeVisible();
  await expect(page.getByText("Las contraseñas no coinciden.")).toBeVisible();

  await page.getByLabel("Contraseña", { exact: true }).fill("cafe12345");
  await page.getByLabel("Repetí la contraseña").fill("cafe12345");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("Ya hay una cuenta con ese email.");
});

test("ingresar con la contraseña equivocada muestra el error", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByLabel("Email").fill(CLIENTE.email);
  await page.getByLabel("Contraseña").fill("no-es-esta-1");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("El email o la contraseña no son correctos.");
});

test("un pedido hecho con sesión aparece en Mis pedidos", async ({ page }) => {
  await ingresar(page, CLIENTE);
  await agregarCafe(page, "brasil-cerrado");
  await page.goto("/checkout");
  await completarEnvio(page, CLIENTE.email);
  await page.getByRole("radio", { name: /Transferencia bancaria/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page).toHaveURL(/\/seguimiento\/OC-/);
  const codigo = page.url().match(/OC-[A-Z0-9]{10}/)[0];

  await page.goto("/cuenta");
  await expect(page.getByRole("link", { name: `Pedido ${codigo}` })).toBeVisible();
});
