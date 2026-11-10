// Opciones de las cookies de sesión de Supabase (las usan lib/supabase/servidor.js y proxy.js).
// Auditoría de seguridad:
// - httpOnly: el JavaScript de la página no puede leer la sesión. La tienda nunca la lee en el
//   navegador (todo pasa por /api), así que no se pierde nada y un script inyectado no podría robarla.
// - secure: en Vercel (HTTPS) la cookie solo viaja cifrada. En la compu y en los tests E2E
//   (http://localhost) queda en false para que el login funcione.
// SameSite sigue en "lax", el valor por defecto de @supabase/ssr.
export const OPCIONES_COOKIES = {
  httpOnly: true,
  secure: process.env.VERCEL === "1",
};
