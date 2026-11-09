// Checkout sin cuenta y seguimiento del pedido por código.
import { test, expect } from "@playwright/test";
import { agregarCafe, baseDePrueba, completarEnvio, emailDePrueba } from "./ayudantes.js";

test("enviar el checkout vacío marca cada campo con su error", async ({ page }) => {
  await agregarCafe(page, "etiopia-yirgacheffe");
  await page.goto("/checkout");
  await page.getByRole("button", { name: /Pagar con Mercado Pago|Confirmar pedido/ }).click();
  await expect(page.getByText("Ingresá tu email para avisarte sobre el pedido.")).toBeVisible();
  await expect(page.getByText("Ingresá el nombre y apellido de quien recibe.")).toBeVisible();
  await expect(page.getByText("Elegí la provincia.")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  expect(page.url()).toContain("/checkout");
});

test("compra por transferencia: crea el pedido con el 10% OFF y lleva al seguimiento", async ({ page }) => {
  const email = emailDePrueba("transferencia");
  await agregarCafe(page, "etiopia-yirgacheffe", { molienda: "fina" });
  await page.goto("/checkout");
  await completarEnvio(page, email);
  await page.getByRole("radio", { name: /Transferencia bancaria/ }).check();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();

  await expect(page).toHaveURL(/\/seguimiento\/OC-[A-Z0-9]{10}\?nuevo=1/);
  await expect(page.getByText("¡Recibimos tu pedido!")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Estado: Esperando el pago" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Datos para transferir" })).toBeVisible();
  // $19.500 − 10% = $17.550, + envío $6.500
  await expect(page.getByText("$ 24.050").first()).toBeVisible();

  // En la base quedó con el total calculado por el servidor y la molienda elegida
  const codigo = page.url().match(/OC-[A-Z0-9]{10}/)[0];
  const { data: orden } = await baseDePrueba().from("ordenes").select("*, orden_items(*)").eq("codigo", codigo).single();
  expect(orden).toMatchObject({ email, estado: "pendiente", medio_pago: "transferencia", total: 24050, descuento_transferencia: 1950 });
  expect(orden.orden_items).toEqual([expect.objectContaining({ variante_id: 101, molienda: "fina", cantidad: 1, precio_unitario: 19500 })]);

  // El carrito se vació
  await expect(page.getByRole("button", { name: "Abrir carrito, 0 productos" })).toBeAttached();

  // Seguimiento: buscando el código (en minúsculas también funciona)
  await page.goto("/seguimiento");
  await page.getByLabel("Código de seguimiento").fill(codigo.toLowerCase());
  await page.getByRole("button", { name: /Buscar|Ver/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Pedido ${codigo}`);
});

test("un código de seguimiento mal escrito avisa sin buscar", async ({ page }) => {
  await page.goto("/seguimiento");
  await page.getByLabel("Código de seguimiento").fill("hola");
  await page.getByRole("button", { name: /Buscar|Ver/ }).click();
  await expect(page.getByLabel("Código de seguimiento")).toHaveAttribute("aria-invalid", "true");
  expect(page.url()).toMatch(/\/seguimiento$/);
});

test("un código que no existe da 404", async ({ page }) => {
  const respuesta = await page.goto("/seguimiento/OC-AAAAAAAAAA");
  expect(respuesta.status()).toBe(404);
});
