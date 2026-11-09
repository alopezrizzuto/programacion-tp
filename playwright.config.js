import { defineConfig, devices } from "@playwright/test";
import { SECRETO_WEBHOOK_E2E } from "./tests/e2e/ayudantes.js";

// Tests E2E: abren la tienda en un Chrome de verdad y hacen lo que haría una persona.
// Corren contra un proyecto de Supabase SOLO para tests (nunca el de la tienda real):
// en la compu, sus claves están en .env.e2e.local; en GitHub Actions, en Variables y Secrets.
try {
  process.loadEnvFile(".env.e2e.local");
} catch {
  // En el CI no hay archivo: las variables ya vienen del workflow
}

const FALTAN = ["E2E_SUPABASE_URL", "E2E_SUPABASE_PUBLISHABLE_KEY", "E2E_SUPABASE_SECRET_KEY"].filter((v) => !process.env[v]);
if (FALTAN.length > 0) {
  throw new Error(`Faltan variables para los tests E2E: ${FALTAN.join(", ")}. Completalas en .env.e2e.local (ver README, sección Tests).`);
}

const PUERTO = 3100; // otro puerto, para no chocar con el servidor de desarrollo

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/preparar.js",
  globalTeardown: "./tests/e2e/limpiar.js",
  // De a un test por vez: comparten la base de prueba (stock, pedidos) y así no se pisan
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    // Si un test falla, queda una "grabación" paso a paso para ver qué pasó (npx playwright show-trace)
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"] } }],
  // Playwright levanta la tienda antes de los tests: build de producción + next start
  webServer: {
    command: `npm run build && npm run start -- -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      NEXT_PUBLIC_SUPABASE_URL: process.env.E2E_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.E2E_SUPABASE_PUBLISHABLE_KEY,
      SUPABASE_SECRET_KEY: process.env.E2E_SUPABASE_SECRET_KEY,
      // Webhook: una clave inventada (el test firma con la misma) y sin modo sandbox, así la firma se exige
      MERCADOPAGO_WEBHOOK_SECRET: SECRETO_WEBHOOK_E2E,
      MERCADOPAGO_SANDBOX: "false",
      // Vacío a propósito: en los tests nunca se llama a la API de Mercado Pago
      MERCADOPAGO_ACCESS_TOKEN: "",
    },
  },
});
