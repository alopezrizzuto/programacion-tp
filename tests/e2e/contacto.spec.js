// Formulario de contacto (POST /api/contacto).
import { test, expect } from "@playwright/test";
import { baseDePrueba, emailDePrueba } from "./ayudantes.js";

test("enviar vacío marca los errores; completo, se guarda y agradece", async ({ page }) => {
  await page.goto("/contacto");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.getByText("Ingresá tu nombre.")).toBeVisible();
  await expect(page.getByText("Elegí el motivo de tu consulta.")).toBeVisible();

  const email = emailDePrueba("contacto");
  await page.getByLabel("Nombre").fill("Prueba");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Motivo").selectOption("envios");
  await page.getByLabel("Mensaje").fill("¿Hacen envíos a Córdoba capital?");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.getByText("¡Gracias, Prueba!")).toBeVisible();

  const { data } = await baseDePrueba().from("mensajes").select("motivo, mensaje").eq("email", email);
  expect(data).toEqual([{ motivo: "envios", mensaje: "¿Hacen envíos a Córdoba capital?" }]);
});

test("un bot que completa el campo trampa recibe 'ok' pero no se guarda nada", async ({ request }) => {
  const email = emailDePrueba("bot");
  const respuesta = await request.post("/api/contacto", {
    data: { nombre: "Bot", email, motivo: "otro", mensaje: "Comprá seguidores baratos", sitio: "https://spam.com" },
  });
  expect(respuesta.status()).toBe(201);
  const { data } = await baseDePrueba().from("mensajes").select("id").eq("email", email);
  expect(data).toEqual([]);
});
