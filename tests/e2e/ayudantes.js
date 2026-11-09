// Herramientas compartidas por los tests E2E.
import { createClient } from "@supabase/supabase-js";
import { expect } from "@playwright/test";

// Clave del webhook que usa el servidor de los tests (playwright.config.js): el test de webhook firma con ella
export const SECRETO_WEBHOOK_E2E = "secreto-del-webhook-solo-para-tests";

// Todo lo que crean los tests usa este dominio: así la limpieza sabe qué borrar
export const DOMINIO = "e2e.origencafe.com.ar";
export const emailDePrueba = (nombre) => `${nombre}-${Date.now()}@${DOMINIO}`;

export const ADMIN = { email: `admin@${DOMINIO}`, nombre: "Admin E2E" };
export const CLIENTE = { email: `cliente@${DOMINIO}`, nombre: "Cliente E2E" };
// La contraseña la genera preparar.js en cada corrida (no queda escrita en el repo)
export const contrasena = () => process.env.E2E_CONTRASENA;

// Cliente de Supabase con la clave secreta del proyecto de PRUEBA: prepara y revisa datos
export function baseDePrueba() {
  return createClient(process.env.E2E_SUPABASE_URL, process.env.E2E_SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Ingresa desde el formulario, como una persona
export async function ingresar(page, { email }, destino = "/cuenta") {
  await page.goto(`/ingresar?siguiente=${encodeURIComponent(destino)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(contrasena());
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(destino);
}

// Agrega un café al carrito desde su página (eligiendo la molienda) y cierra el panel
export async function agregarCafe(page, slug, { molienda = "media", bolsas = 1 } = {}) {
  await page.goto(`/cafes/${slug}`);
  await page.getByLabel("Molienda").selectOption(molienda);
  if (bolsas > 1) await page.getByRole("radio", { name: new RegExp(`^${bolsas} bolsas`) }).check();
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  const panel = page.getByRole("dialog", { name: /Tu carrito/ });
  await expect(panel).toBeVisible();
  return panel;
}

// Completa los datos de envío del checkout
export async function completarEnvio(page, email) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Nombre y apellido").fill("Prueba Automática");
  await page.getByLabel("Teléfono").fill("11 4567-8901");
  await page.getByLabel("Dirección").fill("Av. Corrientes 1234");
  await page.getByLabel("Ciudad").fill("CABA");
  await page.getByLabel("Provincia").selectOption("Ciudad Autónoma de Buenos Aires");
  await page.getByLabel("Código postal").fill("1414");
}
